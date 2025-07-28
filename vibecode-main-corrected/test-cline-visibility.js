// Script de test avancé pour débugger le Cline Agent
// À exécuter dans la console du navigateur

console.log('🔍 DEBUG AVANCÉ - Test de visibilité de Cline Agent');
console.log('='.repeat(60));

// 1. Vérifier la présence du bouton AI avec une approche robuste
function findAIButton() {
  console.log('\n🔍 Recherche du bouton AI...');
  
  // Recherche manuelle dans tous les boutons
  const allButtons = document.querySelectorAll('button');
  console.log(`Total de boutons trouvés: ${allButtons.length}`);
  
  // D'abord, chercher spécifiquement le bouton ToggleAI dans la barre d'outils principale
  // Éviter complètement les sidebars et file explorers
  const mainContentButtons = Array.from(allButtons).filter(btn => {
    const buttonClassName = btn.className || '';
    const isInSidebar = btn.getAttribute('data-sidebar') || 
                       btn.getAttribute('data-slot') ||
                       btn.closest('[data-sidebar]') ||
                       btn.closest('.sidebar') ||
                       (typeof buttonClassName === 'string' && buttonClassName.includes('sidebar'));
    return !isInSidebar;
  });
  
  console.log(`Boutons hors sidebar: ${mainContentButtons.length}`);
  
  for (let i = 0; i < mainContentButtons.length; i++) {
    const button = mainContentButtons[i];
    const text = button.textContent?.trim() || '';
    const buttonClassName = button.className || '';
    
    // Chercher spécifiquement le bouton ToggleAI
    // D'après le code: Button avec "AI" text, Bot icon, et classes spécifiques
    const hasExactAIText = text === 'AI';
    const hasBotIcon = button.querySelector('svg') && (
      button.innerHTML.includes('Bot') || 
      button.innerHTML.includes('bot') ||
      button.querySelector('[class*="lucide"]')
    );
    
    // Classes spécifiques du ToggleAI: gap-2, h-8, px-3, text-sm, font-medium
    const hasToggleAIClasses = typeof buttonClassName === 'string' && 
                              buttonClassName.includes('gap-2') && 
                              buttonClassName.includes('h-8') && 
                              buttonClassName.includes('px-3');
    
    // Conditions pour le bouton ToggleAI
    const isToggleAIButton = hasExactAIText && hasBotIcon && hasToggleAIClasses;
    
    if (isToggleAIButton) {
      console.log(`✅ Bouton ToggleAI trouvé (index ${i}):`);
      console.log(`   - Texte: "${text}"`);
      console.log(`   - Classes: "${buttonClassName}"`);
      console.log(`   - Aria-label: "${button.getAttribute('aria-label') || 'aucun'}"`);
      console.log(`   - A icône Bot: ${hasBotIcon}`);
      console.log(`   - Element:`, button);
      return button;
    }
  }
  
  // Recherche alternative: bouton avec "AI" exact et Bot icon dans le contenu principal
  console.log('\n🔍 Recherche alternative (moins stricte)...');
  for (let i = 0; i < mainContentButtons.length; i++) {
    const button = mainContentButtons[i];
    const text = button.textContent?.trim() || '';
    const buttonClassName = button.className || '';
    
    const hasExactAIText = text === 'AI';
    const hasBotIcon = button.querySelector('svg') && (
      button.innerHTML.includes('Bot') || 
      button.innerHTML.includes('bot') ||
      button.querySelector('[class*="lucide"]')
    );
    
    if (hasExactAIText && hasBotIcon) {
      console.log(`⚠️ Bouton AI alternatif trouvé (index ${i}):`);
      console.log(`   - Texte: "${text}"`);
      console.log(`   - Classes: "${buttonClassName}"`);
      console.log(`   - Element:`, button);
      return button;
    }
  }
  
  console.log('❌ Aucun bouton AI trouvé');
  console.log('\n🔍 Debug: Liste des 15 premiers boutons:');
  for (let i = 0; i < Math.min(15, allButtons.length); i++) {
    const btn = allButtons[i];
    const text = btn.textContent?.trim() || 'vide';
    const hasSvg = btn.querySelector('svg') ? '🎯' : '';
    const isSidebar = btn.getAttribute('data-sidebar') ? '📁' : '';
    console.log(`  ${i}: "${text}" ${hasSvg}${isSidebar} - ${btn.className.substring(0, 50)}...`);
  }
  
  return null;
}

// 2. Analyser la structure des composants React
function analyzeReactComponents() {
  console.log('\n🔍 Analyse des composants React:');
  
  // Chercher les éléments React
  const reactRoot = document.querySelector('[data-reactroot]');
  const reactElements = document.querySelectorAll('[data-testid]');
  console.log('React root trouvé:', !!reactRoot);
  console.log('Éléments avec data-testid:', reactElements.length);
  
  // Chercher les composants par classes
  const allElements = document.querySelectorAll('*');
  let toggleAI = null;
  let aiChat = null;
  let aiButton = null;
  
  for (const el of allElements) {
    const className = el.className || '';
    
    // Vérifier que className est une string avant d'utiliser includes
    if (typeof className !== 'string') continue;
    
    // Chercher ToggleAI
    if (!toggleAI && (className.includes('toggle') || className.includes('Toggle'))) {
      toggleAI = el;
      console.log('✅ Composant ToggleAI détecté:', el);
    }
    
    // Chercher AI Chat
    if (!aiChat && (className.includes('chat') || className.includes('Chat') || className.includes('ai'))) {
      aiChat = el;
      console.log('✅ Composant AI Chat détecté:', el);
    }
  }
  
  // Chercher spécifiquement les boutons avec icône
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    const hasSvg = btn.querySelector('svg');
    const text = btn.textContent?.toLowerCase() || '';
    
    if (hasSvg && (text.includes('ai') || btn.querySelector('[class*="bot"]'))) {
      aiButton = btn;
      console.log('✅ Bouton AI avec icône trouvé:', btn);
      break;
    }
  }
  
  console.log('Résumé des composants:');
  console.log('- ToggleAI détecté:', !!toggleAI);
  console.log('- AI Chat détecté:', !!aiChat);
  console.log('- Bouton AI détecté:', !!aiButton);
  
  return { toggleAI, aiChat, aiButton };
}

// 3. Tester l'interaction avec le bouton AI
function testAIButtonInteraction(aiButton) {
  if (!aiButton) {
    console.log('\n❌ Aucun bouton AI fourni pour le test d\'interaction');
    return;
  }
  
  console.log('\n🎯 Test d\'interaction avec le bouton AI:');
  
  // Vérifier si le bouton est cliquable
  const isDisabled = aiButton.disabled || aiButton.getAttribute('aria-disabled') === 'true';
  console.log('Bouton activé:', !isDisabled);
  
  if (isDisabled) {
    console.log('⚠️ Le bouton AI est désactivé');
    return;
  }
  
  // Simuler un clic
  console.log('🖱️ Simulation du clic sur le bouton AI...');
  try {
    aiButton.click();
    console.log('✅ Clic effectué avec succès');
  } catch (error) {
    console.log('❌ Erreur lors du clic:', error);
    return;
  }
  
  // Attendre et vérifier le dropdown
  setTimeout(() => {
    console.log('\n🔍 Vérification du dropdown après clic...');
    
    // Chercher le dropdown avec différents sélecteurs
    const dropdownSelectors = [
      '[role="menu"]',
      '.dropdown-menu',
      '[data-radix-popper-content-wrapper]',
      '[data-state="open"]',
      '.popover-content'
    ];
    
    let dropdown = null;
    for (const selector of dropdownSelectors) {
      dropdown = document.querySelector(selector);
      if (dropdown) {
        console.log(`✅ Dropdown trouvé avec sélecteur: ${selector}`);
        break;
      }
    }
    
    if (dropdown) {
      console.log('Contenu du dropdown:', dropdown.innerHTML.substring(0, 200) + '...');
      
      // Chercher l'option "Open Chat" - d'après le code ToggleAI
      const allElements = dropdown.querySelectorAll('*');
      let openChatItem = null;
      
      // Recherche spécifique pour "Open Chat" avec icône FileText
      for (const el of allElements) {
        const text = el.textContent?.trim() || '';
        const hasOpenChatText = text === 'Open Chat' || text.includes('Open Chat');
        const hasFileTextIcon = el.querySelector('svg') && el.innerHTML.includes('FileText');
        const className = el.className || '';
        const isClickable = el.tagName === 'BUTTON' || el.getAttribute('role') === 'menuitem' || (typeof className === 'string' && className.includes('cursor-pointer'));
        
        if (hasOpenChatText && (hasFileTextIcon || isClickable)) {
          openChatItem = el;
          console.log(`✅ Option "Open Chat" trouvée: "${text}"`);
          console.log(`   - Element: ${el.tagName}`);
          console.log(`   - Classes: ${className}`);
          console.log(`   - A icône FileText: ${hasFileTextIcon}`);
          break;
        }
      }
      
      // Recherche alternative plus large
      if (!openChatItem) {
        console.log('\n🔍 Recherche alternative pour "Open Chat"...');
        for (const el of allElements) {
          const text = el.textContent?.toLowerCase() || '';
          const className = el.className || '';
          const isClickableElement = el.tagName === 'BUTTON' || 
                                    el.getAttribute('role') === 'menuitem' || 
                                    (typeof className === 'string' && className.includes('cursor-pointer')) ||
                                    (typeof className === 'string' && className.includes('dropdown-menu-item'));
          
          if ((text.includes('open chat') || text.includes('chat')) && isClickableElement) {
            openChatItem = el;
            console.log(`⚠️ Option chat alternative trouvée: "${el.textContent?.trim()}"`);
            break;
          }
        }
      }
      
      if (openChatItem) {
        console.log('🖱️ Clic sur l\'option chat...');
        try {
          openChatItem.click();
          console.log('✅ Clic sur option chat effectué');
          
          // Attendre l'ouverture du chat
          setTimeout(() => {
            testClineAgentVisibility();
          }, 1500);
        } catch (error) {
          console.log('❌ Erreur lors du clic sur option chat:', error);
        }
      } else {
        console.log('❌ Option "Open Chat" non trouvée dans le dropdown');
        console.log('\n🔍 Debug: Éléments cliquables dans le dropdown:');
        const clickableElements = dropdown.querySelectorAll('button, [role="menuitem"], [class*="cursor-pointer"], [class*="dropdown-menu-item"]');
        clickableElements.forEach((el, i) => {
          if (i < 10) {
            console.log(`  ${i}: "${el.textContent?.trim() || 'vide'}" - ${el.tagName} - ${el.className}`);
          }
        });
        
        console.log('\n🔍 Tous les éléments avec texte:');
        allElements.forEach((el, i) => {
          if (el.textContent?.trim() && i < 15) {
            console.log(`  ${i}: "${el.textContent.trim()}" - ${el.tagName}`);
          }
        });
      }
    } else {
      console.log('❌ Dropdown non ouvert après le clic');
      console.log('Vérifiez que le bouton AI fonctionne correctement');
    }
  }, 1000);
}

// 4. Tester la visibilité du Cline Agent
function testClineAgentVisibility() {
  console.log('\n🤖 Test de visibilité du Cline Agent:');
  
  // Chercher spécifiquement le composant AIChatWithAgent
  // D'après le code ToggleAI, il est rendu conditionnellement quand isChatOpen est true
  let chatPanel = null;
  
  // Approche 1: Chercher par attributs data ou classes spécifiques au chat AI
  const aiChatSelectors = [
    '[class*="ai-chat"]',
    '[class*="chat-panel"]',
    '[class*="agent-chat"]',
    '[data-testid*="chat"]',
    '[data-testid*="ai"]'
  ];
  
  for (const selector of aiChatSelectors) {
    const element = document.querySelector(selector);
    if (element && element.offsetHeight > 100) {
      console.log(`✅ Panneau AI Chat trouvé avec: ${selector}`);
      chatPanel = element;
      break;
    }
  }
  
  // Approche 2: Chercher dans les éléments récemment ajoutés au DOM
  if (!chatPanel) {
    console.log('\n🔍 Recherche dans les éléments récents...');
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      // Éviter la page principale (body entier)
      if (div.className.includes('min-h-screen') && div.offsetHeight > 500) {
        continue;
      }
      
      // Chercher des divs qui pourraient être le chat AI
      const hasTabsOrButtons = div.querySelectorAll('button[role="tab"], [role="tab"]').length > 1;
      const hasReasonableSize = div.offsetHeight > 200 && div.offsetHeight < 600 && div.offsetWidth > 300;
      const hasAIRelatedContent = div.innerHTML.toLowerCase().includes('agent') || 
                                 div.innerHTML.toLowerCase().includes('chat') ||
                                 (div.innerHTML.toLowerCase().includes('ai') && !div.innerHTML.includes('File Explorer'));
      
      // Vérifier que ce n'est pas un sidebar ou file explorer
      const isSidebar = div.className.includes('sidebar') || div.innerHTML.includes('File Explorer');
      
      if (hasTabsOrButtons && hasReasonableSize && hasAIRelatedContent && !isSidebar) {
        console.log(`✅ Panneau AI Chat potentiel trouvé:`);
        console.log(`   - Classes: ${div.className}`);
        console.log(`   - Taille: ${div.offsetWidth}x${div.offsetHeight}`);
        console.log(`   - Onglets: ${div.querySelectorAll('button[role="tab"], [role="tab"]').length}`);
        chatPanel = div;
        break;
      }
    }
  }
  
  if (!chatPanel) {
    console.log('❌ Aucun panneau AI Chat trouvé');
    console.log('\n🔍 Debug: Recherche de tous les éléments avec "chat" ou "ai":');
    const allElements = document.querySelectorAll('*');
    let found = 0;
    for (const el of allElements) {
      if (found >= 5) break;
      const className = el.className.toLowerCase();
      const innerHTML = el.innerHTML.toLowerCase();
      if ((className.includes('chat') || className.includes('ai') || 
           innerHTML.includes('agent') || innerHTML.includes('chat')) && 
          el.offsetHeight > 50) {
        console.log(`  - ${el.tagName}: "${el.className}" (${el.offsetWidth}x${el.offsetHeight})`);
        found++;
      }
    }
    return false;
  }
  
  console.log(`Classes du panneau AI: ${chatPanel.className}`);
  
  // Chercher les onglets dans le panneau AI
  const tabs = chatPanel.querySelectorAll('button[role="tab"], [role="tab"], button[class*="tab"], [class*="tab-trigger"], [data-state]');
  console.log(`Onglets trouvés dans le panneau AI: ${tabs.length}`);
  
  if (tabs.length === 0) {
    console.log('❌ Aucun onglet trouvé dans le panneau AI');
    // Chercher tous les boutons dans le panneau
    const allButtons = chatPanel.querySelectorAll('button');
    console.log(`Boutons trouvés dans le panneau: ${allButtons.length}`);
    allButtons.forEach((btn, i) => {
      if (i < 5) {
        console.log(`  Bouton ${i}: "${btn.textContent?.trim() || 'vide'}" - ${btn.className}`);
      }
    });
    console.log('Contenu du panneau:', chatPanel.innerHTML.substring(0, 300) + '...');
    return false;
  }
  
  // Lister tous les onglets trouvés
  console.log('\n📋 Onglets disponibles:');
  tabs.forEach((tab, i) => {
    const text = tab.textContent?.trim() || 'vide';
    const isActive = tab.getAttribute('data-state') === 'active' || tab.getAttribute('aria-selected') === 'true';
    console.log(`  ${i}: "${text}" ${isActive ? '(actif)' : ''} - ${tab.className}`);
  });
  
  // Chercher l'onglet "Agent" ou "Cline"
  let agentTab = null;
  for (const tab of tabs) {
    const text = tab.textContent?.toLowerCase() || '';
    if (text.includes('agent') || text.includes('cline')) {
      agentTab = tab;
      console.log(`✅ Onglet Agent trouvé: "${tab.textContent}"`);
      break;
    }
  }
  
  // Si pas d'onglet "Agent" explicite, prendre le deuxième onglet
  if (!agentTab && tabs.length >= 2) {
    agentTab = tabs[1];
    console.log(`⚠️ Utilisation du 2ème onglet comme Agent: "${agentTab.textContent}"`);
  }
  
  if (!agentTab) {
    console.log('❌ Aucun onglet Agent trouvé');
    return false;
  }
  
  // Cliquer sur l'onglet Agent
  console.log('🖱️ Clic sur l\'onglet Agent...');
  agentTab.click();
  
  // Attendre un peu et vérifier le contenu
  setTimeout(() => {
    const clineContent = chatPanel.querySelector('[class*="cline"], [class*="agent"], [class*="assistant"], [class*="claude"]');
    if (clineContent) {
      console.log('✅ Contenu Cline Agent détecté!');
      console.log('Classes du contenu:', clineContent.className);
    } else {
      console.log('❌ Contenu Cline Agent non trouvé');
      console.log('Contenu actuel du panneau:', chatPanel.innerHTML.substring(0, 500) + '...');
    }
  }, 1000);
  
  return true;
}

// 5. Analyser les erreurs potentielles
function analyzeErrors() {
  console.log('\n🚨 Analyse des erreurs potentielles:');
  
  // Vérifier React
  try {
    if (typeof React !== 'undefined') {
      console.log('✅ React disponible');
    } else {
      console.log('❌ React non disponible globalement');
    }
  } catch (e) {
    console.log('❌ Erreur lors de la vérification de React:', e.message);
  }
  
  // Vérifier les erreurs dans la console
  const errors = [];
  const originalError = console.error;
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  console.log('Surveillance des erreurs activée');
}

// Fonction principale de test
function runCompleteTest() {
  console.log('🚀 DÉMARRAGE DU TEST COMPLET...');
  
  // Analyser les composants
  const components = analyzeReactComponents();
  
  // Analyser les erreurs
  analyzeErrors();
  
  // Trouver le bouton AI
  const aiButton = components.aiButton || findAIButton();
  
  if (aiButton) {
    console.log('\n🎯 Test d\'interaction avec le bouton AI...');
    testAIButtonInteraction(aiButton);
  } else {
    console.log('\n❌ PROBLÈME PRINCIPAL: Bouton AI non trouvé');
    console.log('Vérifiez que le composant ToggleAI est bien rendu dans le DOM');
    
    // Debug supplémentaire
    const allButtons = document.querySelectorAll('button');
    console.log(`\n🔍 DEBUG: ${allButtons.length} boutons trouvés au total`);
    
    console.log('Premiers boutons:');
    for (let i = 0; i < Math.min(15, allButtons.length); i++) {
      const btn = allButtons[i];
      const text = btn.textContent?.trim() || 'vide';
      const hasSvg = btn.querySelector('svg') ? '📊' : '';
      console.log(`  ${i}: "${text}" ${hasSvg} - ${btn.className}`);
    }
  }
}

// Fonction de forçage direct
function forceOpenChatAndTestCline() {
  console.log('\n🔧 FORÇAGE DIRECT DE L\'OUVERTURE DU CHAT:');
  
  // Utiliser la même logique que findAIButton() pour trouver le bon bouton
  const aiButton = findAIButton();
  
  if (!aiButton) {
    console.log('❌ Bouton ToggleAI non trouvé pour forçage');
    return;
  }
  
  console.log('✅ Bouton ToggleAI trouvé pour forçage');
  
  // Forcer le clic
  console.log('🖱️ Forçage du clic...');
  aiButton.click();
  
  setTimeout(() => {
    console.log('\n🔍 Recherche du dropdown après forçage...');
    
    // Chercher le dropdown avec les mêmes sélecteurs
    const dropdownSelectors = [
      '[role="menu"]',
      '.dropdown-menu',
      '[data-radix-popper-content-wrapper]',
      '[data-state="open"]',
      '.popover-content'
    ];
    
    let dropdown = null;
    for (const selector of dropdownSelectors) {
      dropdown = document.querySelector(selector);
      if (dropdown) {
        console.log(`✅ Dropdown trouvé avec: ${selector}`);
        break;
      }
    }
    
    if (!dropdown) {
      console.log('❌ Dropdown non trouvé après forçage');
      return;
    }
    
    // Chercher "Open Chat" avec la même logique améliorée
    const allElements = dropdown.querySelectorAll('*');
    let openChatItem = null;
    
    // Recherche spécifique pour "Open Chat"
    for (const el of allElements) {
      const text = el.textContent?.trim() || '';
      const hasOpenChatText = text === 'Open Chat' || text.includes('Open Chat');
      const elClassName = el.className || '';
      const isClickable = el.tagName === 'BUTTON' || el.getAttribute('role') === 'menuitem' || (typeof elClassName === 'string' && elClassName.includes('cursor-pointer'));
      
      if (hasOpenChatText && isClickable) {
        openChatItem = el;
        console.log(`✅ Option "Open Chat" trouvée pour forçage: "${text}"`);
        break;
      }
    }
    
    // Recherche alternative
    if (!openChatItem) {
      for (const el of allElements) {
        const text = el.textContent?.toLowerCase() || '';
        const elClassName = el.className || '';
        const isClickableElement = el.tagName === 'BUTTON' || el.getAttribute('role') === 'menuitem' || (typeof elClassName === 'string' && elClassName.includes('cursor-pointer'));
        
        if ((text.includes('open chat') || text.includes('chat')) && isClickableElement && text.length < 30) {
          openChatItem = el;
          console.log(`⚠️ Option chat alternative trouvée pour forçage: "${el.textContent?.trim()}"`);
          break;
        }
      }
    }
    
    if (openChatItem) {
      console.log('🖱️ Clic forcé sur option chat...');
      openChatItem.click();
      
      setTimeout(() => {
        testClineAgentVisibility();
      }, 1500);
    } else {
      console.log('❌ Option "Open Chat" non trouvée dans le dropdown');
      console.log('\n🔍 Debug forçage - Éléments cliquables:');
      const clickableElements = dropdown.querySelectorAll('button, [role="menuitem"], [class*="cursor-pointer"]');
      clickableElements.forEach((el, i) => {
        if (i < 10) {
          console.log(`  ${i}: "${el.textContent?.trim() || 'vide'}" - ${el.tagName}`);
        }
      });
    }
  }, 1000);
}

// Instructions pour l'utilisateur
console.log(`
📋 INSTRUCTIONS DE DEBUG:
1. Le script s'exécute automatiquement dans 2 secondes
2. Ou exécutez manuellement: runCompleteTest()
3. Pour forcer l'ouverture: forceOpenChatAndTestCline()
4. Suivez les logs détaillés pour identifier le problème

🎯 Fonctions disponibles:
- runCompleteTest() : Test complet
- forceOpenChatAndTestCline() : Forçage direct
- findAIButton() : Chercher le bouton AI
- analyzeReactComponents() : Analyser les composants`);

// Auto-exécution après 2 secondes
setTimeout(() => {
  console.log('\n🔄 Auto-exécution du test dans 2 secondes...');
  runCompleteTest();
}, 2000);

// Fonction de test avec forçage après 5 secondes
setTimeout(() => {
  console.log('\n🔧 Test de forçage dans 5 secondes...');
  forceOpenChatAndTestCline();
}, 5000);