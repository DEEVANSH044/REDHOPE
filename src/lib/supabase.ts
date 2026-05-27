import { PrismaClient } from "@prisma/client";

// Initialize a single global Prisma Client instance
const prisma = new PrismaClient();

class SupabaseQueryBuilder {
  private table: string;
  private prismaModel: any;
  private filters: { field: string; value: any }[] = [];
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private isDelete: boolean = false;
  private updateData: any = null;
  private insertData: any = null;
  private isCount: boolean = false;

  constructor(table: string) {
    this.table = table;
    const lowerTable = table.toLowerCase();
    let modelName = lowerTable;
    if (lowerTable === "users") {
      modelName = "user";
    } else if (lowerTable === "bloodrequest") {
      modelName = "bloodRequest";
    } else if (lowerTable === "bloodbank") {
      modelName = "bloodBank";
    } else if (lowerTable === "donor" || lowerTable === "donors") {
      modelName = "donor";
    } else if (lowerTable === "bloodinventory" || lowerTable === "blood_inventory") {
      modelName = "bloodInventory";
    } else if (lowerTable === "activity" || lowerTable === "activities") {
      modelName = "activity";
    } else if (lowerTable === "notification" || lowerTable === "notifications") {
      modelName = "notification";
    }
    
    this.prismaModel = (prisma as any)[modelName];
    if (!this.prismaModel) {
      console.warn(`[Supabase Wrapper] Warning: Prisma model not found for table "${table}" (mapped to "${modelName}")`);
    }
  }

  select(_fields: string = "*", options?: { count?: string; head?: boolean }) {
    if (options?.count === "exact") {
      this.isCount = true;
    }
    return this;
  }

  insert(data: any) {
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  eq(field: string, value: any) {
    let finalValue = value;
    // Auto-convert stringified numbers for ID fields to match Prisma's Int type
    if ((field === "id" || field === "userId" || field === "id" || field === "userId") && typeof value === "string") {
      const num = Number(value);
      if (!isNaN(num)) {
        finalValue = num;
      }
    }
    this.filters.push({ field, value: finalValue });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  private buildWhere() {
    const where: any = {};
    for (const f of this.filters) {
      where[f.field] = f.value;
    }
    return where;
  }

  private getIncludes() {
    const lower = this.table.toLowerCase();
    if (lower === "user" || lower === "users") {
      return { profile: true };
    }
    if (lower === "profile") {
      return { user: true };
    }
    if (lower === "project" || lower === "bloodrequest" || lower === "appointment") {
      return { user: true };
    }
    return undefined;
  }

  async maybeSingle() {
    try {
      const where = this.buildWhere();
      const include = this.getIncludes();
      const data = await this.prismaModel.findFirst({
        where,
        ...(include ? { include } : {})
      });
      return { data, error: null };
    } catch (err: any) {
      console.error(`[Supabase Wrapper Error] maybeSingle failed on table ${this.table}:`, err);
      return { data: null, error: err };
    }
  }

  async single() {
    try {
      const where = this.buildWhere();
      const include = this.getIncludes();
      let data = null;

      if (this.insertData) {
        data = await this.prismaModel.create({
          data: this.insertData,
          ...(include ? { include } : {})
        });
      } else if (this.updateData) {
        // Find first record to get its unique ID
        const record = await this.prismaModel.findFirst({ where });
        if (record) {
          data = await this.prismaModel.update({
            where: { id: record.id },
            data: this.updateData,
            ...(include ? { include } : {})
          });
        }
      } else {
        data = await this.prismaModel.findFirst({
          where,
          ...(include ? { include } : {})
        });
      }
      return { data, error: null };
    } catch (err: any) {
      console.error(`[Supabase Wrapper Error] single failed on table ${this.table}:`, err);
      return { data: null, error: err };
    }
  }

  // Execute chainable builder as a Promise
  async then(onfulfilled?: (value: any) => any) {
    try {
      const where = this.buildWhere();
      const include = this.getIncludes();
      let data: any = null;
      let count: number | null = null;

      if (this.isCount) {
        count = await this.prismaModel.count({ where });
        data = [];
      } else if (this.isDelete) {
        const records = await this.prismaModel.findMany({ where });
        for (const record of records) {
          await this.prismaModel.delete({
            where: { id: record.id }
          });
        }
        data = null;
      } else if (this.updateData) {
        const records = await this.prismaModel.findMany({ where });
        const updated = [];
        for (const record of records) {
          updated.push(
            await this.prismaModel.update({
              where: { id: record.id },
              data: this.updateData,
              ...(include ? { include } : {})
            })
          );
        }
        data = updated;
      } else if (this.insertData) {
        if (Array.isArray(this.insertData)) {
          const inserted = [];
          for (const d of this.insertData) {
            inserted.push(
              await this.prismaModel.create({
                data: d,
                ...(include ? { include } : {})
              })
            );
          }
          data = inserted;
        } else {
          data = [
            await this.prismaModel.create({
              data: this.insertData,
              ...(include ? { include } : {})
            })
          ];
        }
      } else {
        const findOptions: any = { where };
        if (this.orderField) {
          findOptions.orderBy = {
            [this.orderField]: this.orderAscending ? "asc" : "desc"
          };
        }
        if (include) {
          findOptions.include = include;
        }
        data = await this.prismaModel.findMany(findOptions);
      }

      const res = { data, error: null, count };
      return onfulfilled ? onfulfilled(res) : res;
    } catch (err: any) {
      console.error(`[Supabase Wrapper Error] then/execution failed on table ${this.table}:`, err);
      const res = { data: null, error: err, count: null };
      return onfulfilled ? onfulfilled(res) : res;
    }
  }
}

export const supabase = {
  from(table: string) {
    return new SupabaseQueryBuilder(table);
  }
};
