var env = {
    webPort: process.env.PORT || 3000,
    dbHost: process.env.DB_HOST || 'ds135196.mlab.com',
    dbPort: process.env.DB_PORT || '35196',
    dbUser: process.env.DB_USER || 'koen',
    dbPassword: process.env.DB_PASSWORD || 'admin123',
    dbDatabase: process.env.DB_DATABASE || 'bioscoop'
}

var dburl = process.env.NODE_ENV === 'production' ?
    'mongodb://' + env.dbUser + ':' + env.dbPassword + '@' + env.dbHost + ':' + env.dbPort + '/' + env.dbDatabase :
    'mongodb://localhost/' + env.dbDatabase

module.exports = {
    env: env,
    dburl: dburl
};