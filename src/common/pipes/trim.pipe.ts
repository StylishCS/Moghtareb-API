import {
  type PipeTransform,
  Injectable,
  type ArgumentMetadata,
} from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== "object" || value === null) {
      return value;
    }

    const trimmedObject = this.trimStrings(value);
    return trimmedObject;
  }

  private trimStrings(obj: any): any {
    if (typeof obj === "string") {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map((value) => this.trimStrings(value));
    }

    if (typeof obj === "object" && obj !== null) {
      const trimmedObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          trimmedObj[key] = this.trimStrings(obj[key]);
        }
      }
      return trimmedObj;
    }

    return obj;
  }
}
