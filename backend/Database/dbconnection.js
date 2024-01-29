import mysql from 'mysql';

export const stablishedConnection = () => {
    return new Promise((resolve,reject) => {
        const con = mysql.createConnection( {
            host: "localhost",
            user: "root",
            password: "932562dq8@VV",
            database: "signup"
        });

        con.connect((err) => {
            if(err){
                reject(err);
            }
            resolve(con);
        });
    
    })
}

export const closeDbConnection = (con) => {
    con.destroy();
}

