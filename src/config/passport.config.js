import passport from "passport";
import local from 'passport-local';
import GithubStrategy from 'passport-github2';
import UserManager from "../dao/mongo/managers/userManager.js";
import auth from "../services/auth.services.js";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { cookieExtractor } from "../utils.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


const LocalStrategy = local.Strategy; //local = user + pass
const usersServices = new UserManager();

const initializeStrategies = () => {
    //  -- Registro
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email', session: false },
        async (req, email, password, done) => {

            try {
                const { firstName, lastName, age } = req.body;
                if (!firstName || !lastName || !email || !age || !password)
                    return done(null, false, { message: "incomplete values" })
                //Corroborar que el usuario no exista.
                const exists = await usersService.getUserBy({ email });
                if (exists)
                    return done(null, false, { message: "User already exists" });
                //Antes de crear al usuario, necesito aplicar un hash a su contraseña
                const hashedPasword = await auth.createHash(password);   //hasheo la pass
                const newUser = { firstName, lastName, email, age, password: hashedPasword };
                //Ahora sí creo al usuario
                const result = await usersServices.create(newUser);
                done(null, result);

                //Revisar el carrito temporal
                let cart;
                if (req.cookies["cart"]) {
                    //Obtener el que ya esta en la cookie
                    cart = req.cookies["cart"];
                } else {
                    cartResult = await cartSevice.createCart();
                    cart = cartResult.id;
                }
                newUser.cart = cart


            } catch (error) {
                console.log(error);
                return done(error);
            }
        }));
    //  -- Login
    passport.use('login', new LocalStrategy(
        { usernameField: 'email', session: false },
        async (email, password, done) => {
            try {
                //Trae el email de usuario
                const user = await usersService.getUserBy({ email });
                //Trae la validacion de contraseña del usuario
                const isValidPassword = await authService.validatePassword(
                    password, user.password)
                //Valida si se trata de un usuario administrador
                if (email === config.app.ADMIN_EMAIL &&
                    password === config.app.ADMIN_PASSWORD) {
                    const adminUser = { role: "admin", id: "0", firstName: "admin" };
                    return done(null, adminUser);
                }
                //Valida la existencia del usuario 
                else if (!user) {
                    return done(null, false, { message: "Invalid Credentials" });
                }
                //Valida su contraseña, ¿es equivalente?
                else if (!isValidPassword) {
                    return done(null, false, { message: "Invalid Credentials" });
                }
                //Estan vacios los campos?
                else if (!email || !password) {
                    return done(null, false, { message: "incomplete values" })
                }
                //Si funciona returna el usuario logeado
                return done(null, user);

            } catch (error) {
                console.log(error);
                return done(error);
            }
        }));
    // -- GitHub
    passport.use('github', new GithubStrategy(
        {
            clientID: 'Iv1.5d36ca68f3d257e8',
            clientSecret: 'bcb1e903c4f617c7a03f309dd713b9ebed8474db',
            callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
        }, async (accessToken, refreshToken, profile, done) => {
            const { email, name } = profile._json;
            const user = await usersServices.getBy({ email });
            if (!user) {
                const newUser =
                    { firstName: name, email, password: '' }
                const result = await usersServices.create(newUser);
                done(null, result);

            } else {
                done(null, user);
            }
        }))
    // -- Google
    passport.use('google', new GoogleStrategy(
        {
            clientID: "330032633392-p7t1ogcprtvl324a4cjdhhak9l3f8lll.apps.googleusercontent.com",
            clientSecret: "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",
            callbackURL: "http://localhost:8080/api/sessions/googlecallback",
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const { _json } = profile;
                const user = await usersServices.getBy({ email: _json.email });
                //Valida la existencia de un usuario con el email ingresado.
                if (user)
                    return done(null, user);
                else {
                    //Sino crea usuario
                    const newUser = {
                        firstName: _json.given_name,
                        lastName: _json.family_name,
                        email: _json.email
                    };
                    const createdUser = await usersServices.create(newUser);
                    //Si se creo el usuario, retorna el usuario           
                    if (createdUser)
                        return done(null, createdUser);
                    //Sino manda error
                    else
                        return done(new Error('Error al crear el usuario'), null);
                }
            } catch (error) {
                return done(error, null);
            }
        }));
    //  -- Json Web Token
    passport.use('jwt', new Strategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: 'jwtSecret'
        }, async (payload, done) => {
            return done(null, payload);
        }))
}

passport.serializeUser((user, done) => {
    return done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await usersServices.getBy({ _id: id });
    done(null, user);
});

export default initializeStrategies;