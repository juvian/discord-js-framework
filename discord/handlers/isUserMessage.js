module.exports = (context, next) => context.message.bot == false ? next() : null;