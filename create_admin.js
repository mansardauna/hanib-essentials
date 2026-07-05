const { createClient } = require('@supabase/supabase-js');

const url = 'https://xnqugukfpwhmfyaivzvg.supabase.co';
const key = 'sb_publishable_fvHCNiFAKRxI-sEcjz3w3A_xq7MuzbP';
const supabase = createClient(url, key);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'hanibadmin@gmail.com',
    password: 'AdminPassword123!',
    options: {
      data: {
        username: 'Store Admin',
        role: 'owner',
        address: 'Hanib HQ',
        phone: '08000000000'
      }
    }
  });
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success: Admin user created successfully.');
  }
}

createAdmin();
