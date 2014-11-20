//
// DailyCred
//
(function(hello){

    function formatUser(o){
        if(o.id){
            o.thumbnail = o.picture;
            o.name = o.display;
        }
        return o;
    }


    function format(o){
        if (typeof o === 'boolean') {
            o = {success: o};
        }
        if(o && "data" in o){
            var token = hello.getAuthResponse('dailycred').access_token;
            for(var i=0;i<o.data.length;i++){
                var d = o.data[i];
                if(d.picture){
                    d.thumbnail = d.picture;
                }
                if(d.display){
                    d.name = d.display;
                }
            }
        }
        return o;
    }

    var base = 'https://www.dailycred.com/';

    hello.init({
        dailycred : {
            name : 'DailyCred',

            login : function(p){
                // The dailycred login window is a different size.
                p.options.window_width = 580;
                p.options.window_height = 400;
            },

            // https://www.dailycred.com/docs/clientside
            oauth : {
                version : 2,
                auth : 'https://www.dailycred.com/oauth/authorize?action=signinonly',
                grant : 'https://www.dailycred.com/oauth/access_token'
            },

            // Refresh the access_token
            refresh : true,

            logout : function(callback){
                // Assign callback to a global handler
                var callbackID = hello.utils.globalEvent( callback );
                var redirect = encodeURIComponent( hello.settings.redirect_uri + "?" + hello.utils.param( { callback:callbackID, result : JSON.stringify({force:true}), state : '{}' } ) );
                var token = (hello.utils.store('dailycred')||{}).access_token;
                hello.utils.iframe( 'https://www.dailycred.com/oauth/signout?redirect_uri='+ redirect +'&client_id=dailycred' );

                // Possible responses
                // String URL	- hello.logout should handle the logout
                // undefined	- this function will handle the callback
                // true			- throw a success, this callback isn't handling the callback
                // false		- throw a error

                if(!token){
                    // if there isn't a token, the above wont return a response, so lets trigger a response
                    return false;
                }
            },

            // Authorization scopes
            scope : {
                basic			: 'public_profile'
            },

            // API Base URL
            base : 'https://www.dailycred.com/graph/',

            // Map GET requests
            get : {
                //
                'me' : 'me.json'
            },

            // Map POST requests
            post : {
                'me' : 'me.json'
            },

            // Map DELETE requests
            del : {

            },

            wrap : {
                me : formatUser,
                'default' : format
            },

            // special requirements for handling XHR
            xhr : function(p,qs){
                if(p.method==='get'||p.method==='post'){
                    qs.suppress_response_codes = true;
                }
                // Is this a post with a data-uri?
                if( p.method==='post' && p.data && typeof(p.data.file) === 'string'){
                    // Convert the Data-URI to a Blob
                    p.data.file = hello.utils.toBlob(p.data.file);
                }
                return true;
            },

            // Special requirements for handling JSONP fallback
            jsonp : function(p,qs){
                var m = p.method;
                if( m !== 'get' && !hello.utils.hasBinary(p.data) ){
                    p.data.method = m;
                    p.method = 'get';
                }
                else if(p.method === "delete"){
                    qs.method = 'delete';
                    p.method = "post";
                }
            },

            // Special requirements for iframe form hack
            form : function(p){
                return {
                    // fire the callback onload
                    callbackonload : true
                };
            }
        }
    });


})(hello);
