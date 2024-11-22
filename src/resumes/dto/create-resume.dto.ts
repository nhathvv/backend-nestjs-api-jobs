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
  companyId: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  jobId: mongoose.Schema.Types.ObjectId
}
export class CreateCvDto {
  @IsNotEmpty()
  url: string

  @IsNotEmpty()
  companyId: mongoose.Schema.Types.ObjectId

  @IsNotEmpty()
  jobId: mongoose.Schema.Types.ObjectId
}