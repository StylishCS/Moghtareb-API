import { Injectable } from "@nestjs/common";

export abstract class IAdService{

}

@Injectable()
export class AdService implements IAdService{

}