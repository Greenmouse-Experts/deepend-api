import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards, UsePipes } from "@nestjs/common";
import { CreateFoodCategoryDto, CreateFoodCategorySchema } from "./dto/category.dto";
import { JoiValidationPipe } from "src/common/pipes/validation.pipe";
import { Role } from "src/common/decorators/role/role.decorator";
import { UserRoles } from "src/common/decorators/role/role.enum";
import { AuthGuard } from "src/common/guards/auth.guard";
import { QueryJoiValidationPipe } from "src/common/pipes/query-validation.pipe";
import { PaginationQueryDto, PaginationQuerySchema } from "src/common/dto/requestQuery.dto";

@ApiTags("Admin")
@Controller({ path: "admins", version: "1" })
@UseGuards(AuthGuard) // Ensure the user is authenticated
@Role(UserRoles.Admin) // Only admin can access these routes
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

  @Post('food/categories')
  @ApiOperation({ summary: 'Create a new food category' })
  @UsePipes(new  JoiValidationPipe(CreateFoodCategorySchema))
  async createFoodCategory(@Body() body: CreateFoodCategoryDto) {
    return await this.adminService.createFoodCategory(body.name, body.description);
  }

  @Put('food/categories/:id')
  @ApiOperation({ summary: 'Update an existing food category' })
  @UsePipes(new  JoiValidationPipe(CreateFoodCategorySchema))
  async updateFoodCategory(@Param('id',ParseIntPipe) id: number, @Body() body: CreateFoodCategoryDto) {
    return await this.adminService.updateFoodCategory(id, body.name, body.description);
  }

  @Delete('food/categories/:id')
  @ApiOperation({ summary: 'Delete a food category' })
  async deleteFoodCategory(@Param('id',ParseIntPipe) id: number) {
    return await this.adminService.deleteFoodCategory(id);
  }

  @Get('food/categories')
  @ApiOperation({ summary: 'Get all food categories' })
  async getAllFoodCategories(
    @Query(new QueryJoiValidationPipe(PaginationQuerySchema))
    { page, limit }: PaginationQueryDto
  ) {
    return await this.adminService.getAllFoodCategories(page, limit);
  }

}
