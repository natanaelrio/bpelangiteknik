export async function ResponseData(data, authorization, tambahan, tambahan2) {

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        try {
            const users = data
            if (users) {
                return new Response(JSON.stringify({ isCreated: true, data: users, ...tambahan, ...tambahan2 }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            } else return new Response(JSON.stringify({ isCreated: false }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }
        catch (e) {
            return new Response(JSON.stringify({ isCreated: false }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }
    }

    else
        return new Response(JSON.stringify({ isCreated: false, contact: 'natanael rio wijaya 08971041460' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
}