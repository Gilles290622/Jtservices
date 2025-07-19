import { supabase } from "./src/lib/customSupabaseClient.js";  // Correction du chemin

async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) throw error;
    console.log('Connexion réussie ! Données :', data);
  } catch (error) {
    console.error('Erreur de connexion :', error.message);
  }
}

testConnection();