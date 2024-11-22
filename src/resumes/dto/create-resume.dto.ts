import { IsNotEmpty } from "class-validator"
import mongoose from "mongoose"

export class CreateResumeDto {
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  url: string

  @IsNotEmpty()
  status: string // PENDING-REVIEWING-APPROVED-REJECTED

  @IsNotEmpty()
  company: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  job: mongoose.Schema.Types.ObjectId
}
export class CreateCvDto {
  @IsNotEmpty()
  url: string

  @IsNotEmpty()
  company: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  job: mongoose.Schema.Types.ObjectId
}