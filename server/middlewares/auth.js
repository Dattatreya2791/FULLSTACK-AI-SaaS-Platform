import { clerkClient } from "@clerk/express";


// Middleware to check userId and ElitePlan


export const auth = async (req,res,next)=>{
    try {
        const {userId, has} = await req.auth();
        if (!userId) {
            return res.status(401).json({ success: false, message: "No userId found." })
        }

        const hasElitePlan = await has({plan:'elite'});

        const user = await clerkClient.users.getUser(userId);

       

        if (!hasElitePlan) {
           let freeUsage = user.privateMetadata?.free_usage || 0;

      // Only update if free_usage is not already 0
        if (freeUsage !== 0) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                     free_usage: 0,
                },
            });
            freeUsage = 0;
            }
        }

        req.plan = hasElitePlan ? 'elite':'free'
        next()
    } catch (error) {
        res.status(500).json({success: false, message:error.message})
    }
}