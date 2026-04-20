import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'



const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials.password) {
          throw new Error('Invalid email or password');
        }

        const connectToDatabase = (await import('@/lib/mongodb')).default;
        const User = (await import('@/models/User')).default;
        const bcrypt = (await import('bcryptjs')).default;

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.username }).select('+password');
        
        // Perform bcrypt compare with dummy hash if user not found (timing attack prevention)
        const dummyHash = '$2a$10$DummyHashToPretendUserDoesntExist';
        const isValid = user ? 
          await bcrypt.compare(credentials.password, user.password) :
          await bcrypt.compare(credentials.password, dummyHash);
        
        // Use generic error for both cases to prevent user enumeration
        if (!user || !isValid) {
          throw new Error('Invalid email or password');
        }

        return { id: user._id.toString(), name: user.name, email: user.email };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }