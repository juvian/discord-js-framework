class MissingPermissions extends Error {};

class RequireUserPermissions {
    constructor(permissions) {
        this.permissions = permissions;
    }

    run(context, next) {
        let missingPermissions = this.permissions.filter(p => !context.message.member.hasPermission(p));
        if (missingPermissions.length) throw MissingPermissions(missingPermissions);
        next();
    }
}

module.exports = {MissingPermissions, RequireUserPermissions}