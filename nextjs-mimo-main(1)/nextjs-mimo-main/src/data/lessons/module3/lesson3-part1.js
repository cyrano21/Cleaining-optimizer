const lesson3 = {
  id: '3-3',
  title: 'Gestion d\'état avancée avec Redux',
  description: 'Apprendre à gérer l\'état global d\'une application avec Redux',
  difficulty: 'avancé',
  duration: 60,
  tags: ['Redux', 'Gestion d\'état', 'React', 'Middleware'],
  prerequisites: ['3-1', '3-2'],
  content: `
    <h2>Introduction à Redux</h2>
    <p>Redux est une bibliothèque de gestion d'état prévisible pour les applications JavaScript. Il aide à écrire des applications qui se comportent de manière cohérente, fonctionnent dans différents environnements et sont faciles à tester.</p>
    
    <h3>Les trois principes de Redux</h3>
    <ol>
      <li><strong>Source de vérité unique</strong> : L'état de toute l'application est stocké dans un objet unique (le store)</li>
      <li><strong>L'état est en lecture seule</strong> : La seule façon de modifier l'état est d'émettre une action</li>
      <li><strong>Les changements sont effectués avec des fonctions pures</strong> : Les reducers sont des fonctions pures qui prennent l'état précédent et une action, et retournent le nouvel état</li>
    </ol>
    
    <h3>Les concepts clés</h3>
    
    <h4>1. Actions</h4>
    <p>Les actions sont des objets qui décrivent un événement dans l'application. Elles doivent avoir une propriété <code>type</code> et peuvent avoir d'autres propriétés pour transporter des données.</p>
    <pre><code>// Exemple d'action
const addTodo = (text) => ({
  type: 'todos/add',
  payload: {
    id: Date.now(),
    text,
    completed: false
  }
});</code></pre>

    <h4>2. Reducers</h4>
    <p>Les reducers sont des fonctions pures qui spécifient comment l'état change en réponse aux actions.</p>
    <pre><code>// Exemple de reducer
const todos = (state = [], action) => {
  switch (action.type) {
    case 'todos/add':
      return [...state, action.payload];
    case 'todos/toggle':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
};</code></pre>

    <h4>3. Store</h4>
    <p>Le store est l'objet qui rassemble l'état, les reducers et les méthodes pour gérer les actions.</p>
    <pre><code>import { createStore } from 'redux';

const store = createStore(rootReducer);

// Pour accéder à l'état
const state = store.getState();

// Pour envoyer une action
store.dispatch(addTodo('Apprendre Redux'));

// Pour s'abonner aux changements
const unsubscribe = store.subscribe(() => {
  console.log('État mis à jour:', store.getState());
});

// Pour se désabonner
unsubscribe();</code></pre>

    <h4>4. Middleware</h4>
    <p>Les middlewares comme Redux Thunk permettent d'écrire des actions asynchrones.</p>
    <pre><code>// Action asynchrone avec Redux Thunk
const fetchTodos = () => async (dispatch) => {
  dispatch({ type: 'todos/loading' });
  try {
    const response = await fetch('/api/todos');
    const todos = await response.json();
    dispatch({ type: 'todos/loaded', payload: todos });
  } catch (error) {
    dispatch({ type: 'todos/error', payload: error.message });
  }
};

// Utilisation avec configureStore
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk]
});</code></pre>
  `,
  example: {
    title: 'Application de gestion de tâches avec Redux',
    code: `// store/todosSlice.js
import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    addTodo: (state, action) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      state.items = state.items.filter(todo => todo.id !== action.payload);
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { addTodo, toggleTodo, deleteTodo, setStatus, setError } = todosSlice.actions;

export const fetchTodos = () => async (dispatch) => {
  dispatch(setStatus('loading'));
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
    if (!response.ok) throw new Error('Erreur lors du chargement des tâches');
    const todos = await response.json();
    dispatch(todosSlice.actions.todosLoaded(todos));
    dispatch(setStatus('succeeded'));
  } catch (err) {
    dispatch(setError(err.message));
    dispatch(setStatus('failed'));
  }
};

export default todosSlice.reducer;`,
    explanation: 'Cette première partie montre comment configurer un slice Redux pour gérer des tâches, y compris les actions synchrones et asynchrones.'
  },
  // La suite sera dans la partie 2
  exercise: null,
  quiz: null,
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson3;
