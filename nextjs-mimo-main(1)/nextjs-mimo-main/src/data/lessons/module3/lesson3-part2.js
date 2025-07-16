const lesson3Part2 = {
  ...require('./lesson3-part1'),
  example: {
    title: 'Configuration du store et utilisation avec React',
    code: `// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from './todosSlice';

export const store = configureStore({
  reducer: {
    todos: todosReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['todos/fetchTodos/pending', 'todos/fetchTodos/fulfilled', 'todos/fetchTodos/rejected'],
      },
    }),
});

// components/TodoList.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTodo, deleteTodo, fetchTodos } from '../store/todosSlice';

const TodoList = () => {
  const { items, status, error } = useSelector(state => state.todos);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodos());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Chargement des tâches...</div>;
  }

  if (status === 'failed') {
    return <div>Erreur: {error}</div>;
  }

  return (
    <ul style={{
      listStyle: 'none',
      padding: 0,
      maxWidth: '500px',
      margin: '20px auto'
    }}>
      {items.map(todo => (
        <li key={todo.id} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          margin: '5px 0',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          textDecoration: todo.completed ? 'line-through' : 'none',
          opacity: todo.completed ? 0.7 : 1
        }}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch(toggleTodo(todo.id))}
            style={{
              marginRight: '10px',
              transform: 'scale(1.5)'
            }}
          />
          <span style={{ flex: 1 }}>{todo.title || todo.text}</span>
          <button
            onClick={() => dispatch(deleteTodo(todo.id))}
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;`,
    explanation: 'Cette partie montre comment configurer le store Redux et l\'utiliser avec des composants React, y compris le chargement asynchrone des données.'
  },
  exercise: {
    title: 'Gestionnaire de dépenses avec Redux',
    description: 'Créez une application de suivi des dépenses en utilisant Redux Toolkit avec les fonctionnalités suivantes :',
    requirements: [
      'Afficher la liste des dépenses',
      'Ajouter une nouvelle dépense avec un montant et une catégorie',
      'Supprimer une dépense',
      'Filtrer les dépenses par catégorie',
      'Afficher le total des dépenses'
    ],
    initialCode: `// Votre implémentation ici
// 1. Créez un slice pour les dépenses
// 2. Implémentez les actions nécessaires
// 3. Créez les composants React
// 4. Connectez-les au store Redux`,
    solution: `// store/expensesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    items: [],
    filters: {
      category: 'all',
      minAmount: 0,
      maxAmount: 10000
    }
  },
  reducers: {
    addExpense: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ description, amount, category }) {
        return {
          payload: {
            id: Date.now(),
            description,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString()
          }
        };
      }
    },
    removeExpense(state, action) {
      state.items = state.items.filter(expense => expense.id !== action.payload);
    },
    setCategoryFilter(state, action) {
      state.filters.category = action.payload;
    },
    setAmountFilter(state, action) {
      const { min, max } = action.payload;
      state.filters.minAmount = min;
      state.filters.maxAmount = max;
    }
  }
});

export const { addExpense, removeExpense, setCategoryFilter, setAmountFilter } = expensesSlice.actions;

export const selectFilteredExpenses = (state) => {
  const { items } = state.expenses;
  const { category, minAmount, maxAmount } = state.expenses.filters;
  
  return items.filter(expense => {
    const matchesCategory = category === 'all' || expense.category === category;
    const matchesAmount = expense.amount >= minAmount && expense.amount <= maxAmount;
    return matchesCategory && matchesAmount;
  });
};

export const selectTotalExpenses = (state) => {
  return state.expenses.items.reduce(
    (total, expense) => total + expense.amount,
    0
  );
};

export default expensesSlice.reducer;

// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from './expensesSlice';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer
  }
});

// components/ExpenseForm.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addExpense } from '../store/expensesSlice';

const categories = ['alimentation', 'transport', 'logement', 'loisirs', 'santé', 'autres'];

const ExpenseForm = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const dispatch = useDispatch();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (description && amount && !isNaN(amount)) {
      dispatch(addExpense({ description, amount, category }));
      setDescription('');
      setAmount('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="description" style={styles.label}>
          Description :
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
          required
        />
      </div>
      
      <div style={styles.formGroup}>
        <label htmlFor="amount" style={styles.label}>
          Montant (€) :
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target)}
          style={styles.input}
          step="0.01"
          min="0"
          required
        />
      </div>
      
      <div style={styles.formGroup}>
        <label htmlFor="category" style={styles.label}>
          Catégorie :
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <button type="submit" style={styles.submitButton}>
        Ajouter la dépense
      </button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
    transition: 'background-color 0.3s'
  }
};

export default ExpenseForm;`,
    tasks: [
      'Créer un slice Redux pour gérer les dépenses',
      'Implémenter les actions pour ajouter et supprimer des dépenses',
      'Ajouter le filtrage par catégorie et montant',
      'Créer un formulaire pour ajouter des dépenses',
      'Afficher la liste des dépenses avec le total',
      'Ajouter des styles CSS pour une meilleure expérience utilisateur'
    ]
  },
  quiz: {
    title: 'Quiz sur Redux (Partie 2)',
    questions: [
      {
        question: 'Quel est le rôle de createSlice dans Redux Toolkit ?',
        options: [
          'Créer un nouveau store',
          'Générer automatiquement des actions et des reducers',
          'Configurer le middleware',
          'Créer des composants React'
        ],
        correctAnswer: 'Générer automatiquement des actions et des reducers',
        explanation: 'createSlice génère automatiquement des action creators et des reducers en fonction des reducers que vous définissez, réduisant ainsi le code passe-partout.'
      },
      {
        question: 'Comment accéder à l\'état dans un composant React avec Redux ?',
        options: [
          'En utilisant le hook useStore',
          'En utilisant le hook useSelector',
          'En important directement le store',
          'En utilisant le hook useContext'
        ],
        correctAnswer: 'En utilisant le hook useSelector',
        explanation: 'Le hook useSelector permet d\'extraire des données du store Redux dans un composant React.'
      },
      {
        question: 'Quelle est la différence entre useDispatch et useSelector ?',
        options: [
          'useDispatch est pour les actions, useSelector pour l\'état',
          'useSelector est pour les actions, useDispatch pour l\'état',
          'Ils font la même chose',
          'Aucune différence'
        ],
        correctAnswer: 'useDispatch est pour les actions, useSelector pour l\'état',
        explanation: 'useDispatch est utilisé pour envoyer des actions au store, tandis que useSelector est utilisé pour lire des données du store.'
      }
    ]
  }
};

export default lesson3Part2;
