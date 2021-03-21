const handler = require('../../middleware/handler')
exports.handler = async (event, context) => {
    const api_name = 'User Access Level Get'

    try {//TODO: This needs to be connected to the db. currently returns hard coded data
        var datetime = await handler.datetime()
        const body = await handler.url_to_json(event.body)
        const table = "users"
        console.log("fffffffff: ", body)
        /*
        use an id below for id_user
        dev id: 0
        vendor tm id: 1
        buyer id: 2
        -----------
        the token can be anything
        */

        var acc_lev = null

        if (body.id_user == 0) {
            acc_lev = [0, 1, 2, 3, 4, 5]
        }
        else if (body.id_user == 1) {
            acc_lev = [1, 3, 4, 5]
        }
        else if (body.id_user == 2) {
            acc_lev = [2, 3, 4, 5]
        }
        else {
            return handler.returner([false, "User does not exist"], api_name, 404)

        }
        return handler.returner([true, { id_access_levels: acc_lev }], api_name)//Sends response to caller - Must be at bottom of handler
    }
    catch (e) {
        console.log(e)
        return handler.returner([false, e], api_name, 500)
    }
};



        /*
        const data = {//data = {[name of column]: "value to insert"}
            token: "test_token",
            id_user: "id_user"
        }*/
        //   const result = await handler.db_insert(data,table)//this creates the query and processes // returns [success bool,data object]

        /*
             var query = "SELECT * FROM user_access_level where ?? = ??;";
        
             var table = ["job_listings","job_titles","job_listings.job_title_id","job_titles.job_title_id"];
         
             query = mysql.format(query,table);
        
        
        
               const result = handler.query(full_qury)
        
               */