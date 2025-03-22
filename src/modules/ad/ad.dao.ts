import { Inject, Injectable } from "@nestjs/common";
import {
  ads,
  adsBedRooms,
  type Ad,
  type User,
} from "../drizzle/drizzle.schema";
import type { CreateAdDto } from "./dto/create-ad.dto";
import { IDrizzleService } from "../drizzle/drizzle.service";

export abstract class IAdDAO {
  abstract create(createAdDto: CreateAdDto, user: User): Promise<Ad>;
  abstract findMany(): Promise<Ad[]>;
  abstract findOne(): Promise<Ad>;
  abstract findSimilar(): Promise<Ad[]>;
  abstract update(): Promise<Ad>;
  abstract delete(): Promise<void>;
  abstract myAds(): Promise<Ad[]>;
}

@Injectable()
export class AdDAO implements IAdDAO {
  constructor(
    @Inject(IDrizzleService) private readonly drizzleService: IDrizzleService
  ) {}
  async create(createAdDto: CreateAdDto, user: User): Promise<Ad> {
    return await this.drizzleService.db.transaction(async (tx) => {
      const [ad] = await tx
        .insert(ads)
        .values({
          ...createAdDto,
          userId: user.id,
          bathrooms: createAdDto.adBedrooms.length,
        })
        .returning();

      createAdDto.adBedrooms.map((adBedroom) => {
        adBedroom.adId = ad.id;
      });

      await tx.insert(adsBedRooms).values(createAdDto.adBedrooms).returning();

      return ad;
    });
  }
  async findMany(): Promise<Ad[]> {
    return await this.drizzleService.db.query.ads.findMany({
      with: {
        user: true,
        bedrooms: true,
      },
    });
  }
  findOne(): Promise<Ad> {
    throw new Error("Method not implemented.");
  }
  findSimilar(): Promise<Ad[]> {
    throw new Error("Method not implemented.");
  }
  update(): Promise<Ad> {
    throw new Error("Method not implemented.");
  }
  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  myAds(): Promise<Ad[]> {
    throw new Error("Method not implemented.");
  }
}
