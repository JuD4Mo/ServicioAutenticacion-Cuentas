class AuthInterface {
    async registrar(datosCliente) {
        throw new Error("Método 'registrar' debe ser implementado.");
    }

    async login(correo, contrasenia) {
        throw new Error("Método 'login' debe ser implementado.");
    }
}

export default AuthInterface;
