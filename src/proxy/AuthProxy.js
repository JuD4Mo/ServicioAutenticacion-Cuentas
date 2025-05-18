import AuthInterface from "../model/AuthInterface.js";

class AuthProxy extends AuthInterface {
    constructor(authService, supabase) {
        super();
        this.authService = authService;  
        this.supabase = supabase;
    }

    async registrar(datosCliente) {
        if (!datosCliente.nombre || !datosCliente.apellido || !datosCliente.correo || !datosCliente.contrasenia) {
            throw new Error("Todos los campos son obligatorios.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datosCliente.correo)) {
            throw new Error("Formato de correo inválido.");
        }

        const { data, error } = await this.supabase
            .from("cuentas")
            .select("idcuenta")
            .eq("correo", datosCliente.correo)
            .maybeSingle();

        if (data) {
            throw new Error("Este correo ya está registrado.");
        }

        return this.authService.registrar(datosCliente);
    }

    async login(correo, contrasenia) {
        if (!correo || !contrasenia) {
            throw new Error("Correo y contraseña son obligatorios.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            throw new Error("Formato de correo inválido.");
        }

            const { data, error } = await this.supabase
            .from("cuentas")
            .select("correo")
            .eq("correo", correo)
            .maybeSingle();

        if (!data) {
            throw new Error("El usuario no existe.");
        }

        return this.authService.login(correo, contrasenia);
    }
}

export default AuthProxy;
