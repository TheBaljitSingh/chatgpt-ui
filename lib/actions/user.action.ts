'user server'
import connectToDatabase, { UserModel } from "@/lib/mongodb";


export async function createUser(user: any){

    try {
        await connectToDatabase();

        const newUser = UserModel.create(user);
        return JSON.parse(JSON.stringify(newUser));
        
    } catch (error) {
        console.log(error);
    }
}