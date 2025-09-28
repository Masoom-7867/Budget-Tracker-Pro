import { supabase } from './supabase';

async function testSupabase() {
  const { data, error } = await supabase.from('user_profiles').select('*');
  if (error) {
    console.error('Error:', error, "TEST Masoom");
  } else {
    console.log('Data:', data, "TEST TASNEEM");
  }
}


// testSupabase()
export default testSupabase