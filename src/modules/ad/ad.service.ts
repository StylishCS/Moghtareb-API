import { Inject, Injectable } from "@nestjs/common";
import type { Ad, User } from "../drizzle/drizzle.schema";
import { IAdDAO } from "./ad.dao";
import type { CreateAdDto } from "./dto/create-ad.dto";

export abstract class IAdService {
  abstract create(createAdDto: CreateAdDto, user: User): Promise<Ad>;
  abstract findMany(): Promise<Ad[]>;
  abstract findOne(): Promise<Ad>;
  abstract findSimilar(): Promise<Ad[]>;
  abstract update(): Promise<Ad>;
  abstract delete(): Promise<void>;
  abstract myAds(): Promise<Ad[]>;
}

@Injectable()
export class AdService implements IAdService {
  constructor(@Inject(IAdDAO) private readonly adDao: IAdDAO) {}
  create(createAdDto: CreateAdDto, user: User): Promise<Ad> {
    return this.adDao.create(createAdDto, user);
  }
  findMany(): Promise<Ad[]> {
    return this.adDao.findMany();
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
