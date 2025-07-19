import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import './JournalFinanciersAuthPage.css';

const JournalFinanciersAuthPage = () => {
  // États initiaux
  const [formData, setFormData] = useState({
    entree: { montant: '', description: '', categorie: '1' },
    sortie: { montant: '', description: '', categorie: '1' },
    search: { date: '', description: '' }
  });
  const [mouvements, setMouvements] = useState([]);
  const [totaux, setTotaux] = useState({ entrees: 0, sorties: 0, bilan: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  // Ajout pour gérer les erreurs

  // Catégories prédéfinies
  const categories = {
    entree: {
      '1': 'Apport caisse',
      '2': 'Apport Gode',
      '3': 'Versement client',
      '4': 'Apport propre',
      '5': 'Dépôt client'
    },
    sortie: {
      '1': 'Dépôt',
      '2': 'Versement bancaire',
      '3': 'Achat', 
      '4': 'Transport'
    }
  };

  // Chargement initial des données
  useEffect(() => {
    console.log('Chargement des mouvements financiers...');  // Débogage
    const chargerMouvements = async () => {
      setLoading(true);
      setError(null);  // Réinitialise l'erreur
      try {
        const { data, error } = await supabase
          .from('mouvements_financiers')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        setMouvements(data || []);
        console.log('Données chargées:', data);  // Débogage
      } catch (error) {
        console.error("Erreur chargement mouvements:", error);
        setError("Impossible de charger les données. Vérifiez votre connexion Supabase.");
      } finally {
        setLoading(false);
      }
    };
    
    chargerMouvements();
  }, []);

  // Calcul des totaux
  useEffect(() => {
    const entrees = mouvements
      .filter(m => m.type === 'Entrée')
      .reduce((sum, m) => sum + (m.montant || 0), 0);
    
    const sorties = mouvements
      .filter(m => m.type === 'Sortie')
      .reduce((sum, m) => sum + (m.montant || 0), 0);
    
    setTotaux({
      entrees,
      sorties,
      bilan: entrees - sorties
    });
  }, [mouvements]);

  // Gestion des formulaires
  const handleChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  // Ajout d'un mouvement
  const ajouterMouvement = async (type, e) => {
    e.preventDefault();
    const { montant, description, categorie } = formData[type.toLowerCase()];
    
    if (!montant || !description) return;

    const nouveauMouvement = {
      date: new Date().toISOString(),
      type,
      description,
      montant: parseInt(montant),
      categorie: categories[type.toLowerCase()][categorie],
      user_id: supabase.auth.user()?.id
    };

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('mouvements_financiers')
        .insert([nouveauMouvement])
        .select();  // Ajout .select() pour récupérer les données insérées
      
      if (error) throw error;
      setMouvements(prev => [data[0], ...prev]);
      setFormData(prev => ({
        ...prev,
        [type.toLowerCase()]: {
          montant: '',
          description: '',
          categorie: '1'
        }
      }));
      console.log('Mouvement ajouté:', data[0]);  // Débogage
    } catch (error) {
      console.error("Erreur ajout mouvement:", error);
      setError("Impossible d'ajouter le mouvement. Vérifiez les champs ou votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  // Recherche de mouvements
  const rechercherMouvements = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('mouvements_financiers')
        .select('*');

      if (formData.search.date) {
        query = query.gte('date', `${formData.search.date}T00:00:00`)
                .lte('date', `${formData.search.date}T23:59:59`);
      }

      if (formData.search.description) {
        query = query.ilike('description', `%${formData.search.description}%`);
      }

      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      setMouvements(data || []);
    } catch (error) {
      console.error("Erreur recherche:", error);
      setError("Erreur lors de la recherche.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Journal Financier - JTS Services</title>
        <meta name="description" content="Gestion des mouvements financiers" />
      </Helmet>

      <div className="journal-container">
        {error && <div className="alert alert-danger">{error}</div>}  {/* Affichage des erreurs */}

        {/* Entêtes et formulaires */}
        <div className="form-section">
          <h3>Gestion des Mouvements</h3>
          
          <form onSubmit={(e) => ajouterMouvement('Entrée', e)}>
            <h4>Entrées</h4>
            <div className="form-group">
              <label>Montant</label>
              <input 
                type="number" 
                value={formData.entree.montant}
                onChange={(e) => handleChange('entree', 'montant', e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input 
                type="text" 
                value={formData.entree.description}
                onChange={(e) => handleChange('entree', 'description', e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select 
                value={formData.entree.categorie}
                onChange={(e) => handleChange('entree', 'categorie', e.target.value)}
              >
                <option value="1">Apport caisse</option>
                <option value="2">Apport Gode</option>
                <option value="3">Versement client</option>
                <option value="4">Apport propre</option>
                <option value="5">Dépôt client</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'En cours...' : 'Ajouter Entrée'}
            </button>
          </form>

          <form onSubmit={(e) => ajouterMouvement('Sortie', e)}>
            <h4>Sorties</h4>
            <div className="form-group">
              <label>Montant</label>
              <input 
                type="number" 
                value={formData.sortie.montant}
                onChange={(e) => handleChange('sortie', 'montant', e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input 
                type="text" 
                value={formData.sortie.description}
                onChange={(e) => handleChange('sortie', 'description', e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select 
                value={formData.sortie.categorie}
                onChange={(e) => handleChange('sortie', 'categorie', e.target.value)}
              >
                <option value="1">Dépôt</option>
                <option value="2">Versement bancaire</option>
                <option value="3">Achat</option>
                <option value="4">Transport</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'En cours...' : 'Ajouter Sortie'}
            </button>
          </form>
        </div>

        {/* Recherche */}
        <div className="search-section">
          <h4>Recherche</h4>
          <input 
            type="date" 
            value={formData.search.date}
            onChange={(e) => handleChange('search', 'date', e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Description" 
            value={formData.search.description}
            onChange={(e) => handleChange('search', 'description', e.target.value)}
          />
          <button onClick={rechercherMouvements} disabled={loading}>
            {loading ? 'En cours...' : 'Rechercher'}
          </button>
        </div>

        {/* Tableau des mouvements */}
        <div className="table-section">
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Montant</th>
                  <th>Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.length === 0 ? (
                  <tr><td colSpan="5">Aucun mouvement trouvé.</td></tr>
                ) : (
                  mouvements.map(mouvement => (
                    <tr key={mouvement.id}>
                      <td>{new Date(mouvement.date).toLocaleDateString()}</td>
                      <td>{mouvement.type}</td>
                      <td>{mouvement.description}</td>
                      <td>{mouvement.montant?.toLocaleString()} F CFA</td>
                      <td>{mouvement.categorie}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          <div className="totals">
            <span>Entrées: {totaux.entrees.toLocaleString()} F CFA</span>
            <span>Sorties: {totaux.sorties.toLocaleString()} F CFA</span>
            <span>Solde: {totaux.bilan.toLocaleString()} F CFA</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default JournalFinanciersAuthPage;