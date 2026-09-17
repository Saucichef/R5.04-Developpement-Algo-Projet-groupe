export interface User {
    /**
     * Identifiant unique de l'utilisateur.
     */
    id: number;
    /**
     * Nom d'utilisateur.
     */
    username: string;
    /**
     * Mot de passe de l'utilisateur.
     */
    password: string;
    /**
     * Prénom de l'utilisateur.
     */
    firstname: string;
    /**
     * Nom de famille de l'utilisateur.
     */
    lastname: string;
    /**
     * Date de création de l'utilisateur.
     * @format ISO 8601
     */
    created_at: string;
}