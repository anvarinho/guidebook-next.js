export default async function signIn(email, password) {
  try {

    const res = await fetch(`${process.env.URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    
    if (!res.ok) {
      console.log(res)
      // Handle errors here if needed
      throw new Error('Failed to log in');
    }
    return await res.json();
  } catch (error) {
    // Handle any other errors that might occur
    console.error('Error:', error.message);
    throw new Error('An error occurred. Please try again later.');
  }
}