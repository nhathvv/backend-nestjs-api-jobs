import { Type } from "class-transformer"
import { IsArray, IsDefined, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested, IsString, IsISO8601, IsDate } from "class-validator"
import { CompanyDTO } from "src/users/dto/create-user.dto"

export class CreateJobDto {
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsString({ each: true })
  skills: string[]

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyDTO)
  company: CompanyDTO

  @IsNotEmpty()
  salary: number

  @IsNotEmpty()
  quantity: number

  @IsNotEmpty()
  level: string

  @IsNotEmpty()
  description: string

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date


  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date
}
