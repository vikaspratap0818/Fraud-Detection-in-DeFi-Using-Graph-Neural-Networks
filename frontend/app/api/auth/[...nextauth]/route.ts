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
          throw new Error('Please enter your email and password');
        }

        const connectToDatabase = (await import('@/lib/mongodb')).default;
        const User = (await import('@/models/User')).default;
        const bcrypt = (await import('bcryptjs')).default;

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.username }).select('+password');
        
        if (!user) {
          throw new Error('No user found with that email address');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password provided');
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