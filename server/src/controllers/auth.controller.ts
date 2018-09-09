import { Post, UseBefore, JsonController, Res, Body, NotFoundError, BadRequestError, UnauthorizedError } from 'routing-controllers';
import { Response } from 'express';
import { Validator } from 'class-validator';
import { LoggingMiddleware } from '../middleware/http_logging.middleware';
import { UserService } from '../services/user.service';
import { User } from '../entities/user/user.model';
import { ApiResponse, HTTP_STATUS_CODE } from '../handlers/api_response.handler';

@JsonController('/auth/')
@UseBefore(LoggingMiddleware)
export class AuthController {

    constructor(private userService: UserService) { }

    /**
     * Login user with email and password data
     * @param response response Object
     * @param user user Object
     */
    @Post()
    public async login(@Res() response: Response, @Body({ required: true }) user: User): Promise<Response> {
        const validator = new Validator();
        if (!validator.isEmail(user.email) || validator.isEmpty(user.email)) {
            throw new BadRequestError('Not valid email');
        }
        if (validator.isEmpty(user.password)) {
            throw new BadRequestError('Password field empty');
        }
        const userDB = await this.userService.getUserByEmail(user.email);
        const apiResponse = new ApiResponse(response);
        if (!userDB) {
            throw new NotFoundError('User not exists');
        }
        const loginResponse = await this.userService.loginUser(user);
        if (loginResponse) {
            return apiResponse
                .withData(loginResponse)
                .withStatusCode(HTTP_STATUS_CODE.OK)
                .build();
        } else {
            throw new UnauthorizedError('Wrong password');
        }
    }

    /**
     * Request a new JWT token data
     * @param response response Object
     * @param tokenData token data object
     */
    @Post('refresh')
    public async refreshToken(@Res() response: Response, @Body({ required: true }) tokenData: any) {
        const validator = new Validator();
        if (!validator.isEmpty(tokenData.token) || (!validator.isEmpty(tokenData.refreshToken))) {
            throw new BadRequestError('Token data empty');
        }
    }
}