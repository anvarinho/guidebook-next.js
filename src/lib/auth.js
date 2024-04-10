// import { useRouter } from 'next/navigation';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readUser } from '@/app/admin/lib/data';

// Function to check if the user is authenticated
export const isAuthenticatedAdmin = async () => {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userID');

    if (typeof userId.value !== 'string') {
      throw new Error('Invalid user ID type');
    }

    const user = await readUser(userId.value);

    if (user && typeof user.isAdmin === 'boolean' && userId) {
      return user.isAdmin;
    } else {
      return false; // User not found or isAdmin property not a boolean
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Handle the error gracefully, e.g., return false
    return false;
  }
};

// Function to redirect the user
// export const redirect = (path: string): void => {
//   // const router = useRouter();
//   router.push(path);
// };

// Function to sign out the user
export const signOut = async () => {
  const cookieStore = cookies();
  cookieStore.delete('token');
  cookieStore.delete('isAdmin');
  redirect('/login');
};