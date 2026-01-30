module.exports = (client) => {
    
    process.on('unhandledRejection', (reason, promise) => {
        console.error(' [Anti-Crash] :: Unhandled Rejection/Catch');
        console.error(reason);
    });

    process.on('uncaughtException', (err, origin) => {
        console.error(' [Anti-Crash] :: Uncaught Exception/Catch');
        console.error(err, origin);
    });

    process.on('uncaughtExceptionMonitor', (err, origin) => {
        console.error(' [Anti-Crash] :: Uncaught Exception Monitor');
        console.error(err, origin);
    });

    process.on('warning', (warning) => {
        console.warn(' [Anti-Crash] :: Warning');
        console.warn(warning);
    });

    console.log("🛡️ Anti-Crash System is now active.");
};