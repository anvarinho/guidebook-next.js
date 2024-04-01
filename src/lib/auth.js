// import { useRouter } from 'next/navigation';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readUser } from '@/app/admin/lib/data';

// Function to check if the user is authenticated
export const isAuthenticatedAdmin = async () => {
  const cookieStore = cookies();
  const userId = cookieStore.get('userID');
  console.log(userId.value);

  // Assuming readUser is an async function
  const user = await readUser(userId.value);
  console.log(user);

  // Ensure user.isAdmin is a boolean, not a string
  return user.isAdmin === true;
};

// Function to redirect the user
// export const redirect = (path: string): void => {
//   // const router = useRouter();
//   router.push(path);
// };

// Function to sign out the user
export const signOut = () => {
  // Clear the authentication tokens
  // localStorage.removeItem('token');
  // localStorage.removeItem('isAdmin');
  // Alternatively, if you're using cookies
  const cookieStore = cookies();
  cookieStore.delete('token');
  cookieStore.delete('isAdmin');
  // Redirect to the login page after signing out
  redirect('/login');
};