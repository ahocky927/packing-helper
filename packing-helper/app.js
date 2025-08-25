// Define the API URL for the generative model.
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const checklistIconsContainer = document.getElementById('checklist-icons');
    const newCategoryInput = document.getElementById('new-category-input');
    const addCategoryButton = document.getElementById('add-category-button');
    const currentChecklistTitle = document.getElementById('current-checklist-title');
    const checklistItemsContainer = document.getElementById('checklist-items');
    const themeToggleButton = document.getElementById('theme-toggle');
    const getAiButton = document.getElementById('get-ai-button');
    const aiLoadingSpinner = document.getElementById('ai-loading');
    const aiErrorDisplay = document.getElementById('ai-error');
    const recommendationList = document.getElementById('recommendation-list');

    // Modal elements
    const modalOverlay = document.getElementById('modal-overlay');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmButton = document.getElementById('modal-confirm');
    const modalCancelButton = document.getElementById('modal-cancel');
    
    // Add modal elements
    const addModalOverlay = document.getElementById('add-modal-overlay');
    const addModalTitle = document.getElementById('add-modal-title');
    const addModalInput = document.getElementById('add-modal-input');
    const addModalConfirm = document.getElementById('add-modal-confirm');
    const addModalCancel = document.getElementById('add-modal-cancel');

    // Define initial packing data
    let packingData = {
        checklists: {
            'home': {
                name: '回家',
                items: {
                    '衣物类': [{ name: 'T恤', checked: false }, { name: '裤子', checked: false }],
                    '电子类': [{ name: '充电器', checked: false }, { name: '耳机', checked: false }],
                    '洗漱用品': [{ name: '牙刷', checked: false }, { name: '毛巾', checked: false }]
                }
            },
            'school': {
                name: '返校',
                items: {
                    '学习用品': [{ name: '笔记本', checked: false }, { name: '笔', checked: false }],
                    '电子类': [{ name: '笔记本电脑', checked: false }, { name: '充电宝', checked: false }],
                    '衣物类': [{ name: '校服', checked: false }]
                }
            },
            'travel': {
                name: '旅行',
                items: {
                    '证件': [{ name: '护照', checked: false }, { name: '身份证', checked: false }],
                    '衣物类': [{ name: '泳衣', checked: false }, { name: '帽子', checked: false }],
                    '药品': [{ name: '创可贴', checked: false }]
                }
            }
        },
        activeChecklist: 'home',
        currentTheme: 'gentle-theme',
    };
    
    let modalCallback = null;
    let addModalType = null;
    let addModalCategory = null;

    // Load data from local storage
    function loadData() {
        const storedData = localStorage.getItem('packingData');
        if (storedData) {
            packingData = JSON.parse(storedData);
        }
        applyTheme(packingData.currentTheme);
        renderAll();
    }

    // Save data to local storage
    function saveData() {
        localStorage.setItem('packingData', JSON.stringify(packingData));
    }

    // Custom Modal logic
    function showCustomModal(message, callback = null) {
        modalMessage.textContent = message;
        modalOverlay.style.display = 'flex';
        modalCallback = callback;
        if (callback) {
            modalCancelButton.style.display = 'inline-block';
        } else {
            modalCancelButton.style.display = 'none';
        }
    }

    function handleModalConfirm() {
        if (modalCallback) {
            modalCallback();
        }
        modalOverlay.style.display = 'none';
    }
    
    function handleModalCancel() {
        modalOverlay.style.display = 'none';
    }

    modalConfirmButton.addEventListener('click', handleModalConfirm);
    modalCancelButton.addEventListener('click', handleModalCancel);

    // Add Modal logic
    function showAddModal(type, category = null) {
        addModalType = type;
        addModalCategory = category;
        if (type === 'checklist') {
            addModalTitle.textContent = '添加新清单';
            addModalInput.placeholder = '请输入清单名称';
        } else {
            addModalTitle.textContent = `在 ${category} 中添加物品`;
            addModalInput.placeholder = '请输入物品名称';
        }
        addModalInput.value = '';
        addModalOverlay.style.display = 'flex';
        addModalInput.focus();
    }

    addModalConfirm.addEventListener('click', () => {
        const inputValue = addModalInput.value.trim();
        if (inputValue) {
            if (addModalType === 'checklist') {
                handleAddChecklist(inputValue);
            } else {
                handleAddItem(addModalCategory, inputValue);
            }
        }
        addModalOverlay.style.display = 'none';
    });

    addModalCancel.addEventListener('click', () => {
        addModalOverlay.style.display = 'none';
    });
    
    addModalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addModalConfirm.click();
        }
    });

    // Theme toggle functionality
    function applyTheme(theme) {
        document.body.classList.remove('gentle-theme', 'cyber-theme');
        document.body.classList.add(theme);
        packingData.currentTheme = theme;
        saveData();
    }
    
    themeToggleButton.addEventListener('click', () => {
        const newTheme = packingData.currentTheme === 'gentle-theme' ? 'cyber-theme' : 'gentle-theme';
        applyTheme(newTheme);
    });

    // Render Checklist Icons
    function renderChecklistIcons() {
        checklistIconsContainer.innerHTML = '';
        const checklistKeys = Object.keys(packingData.checklists);
        checklistKeys.forEach(key => {
            const checklist = packingData.checklists[key];
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'checklist-icon-wrapper';
            const button = document.createElement('button');
            button.className = `checklist-icon ${packingData.activeChecklist === key ? 'active' : ''}`;
            button.textContent = checklist.name;
            button.addEventListener('click', () => handleChecklistClick(key));
            buttonWrapper.appendChild(button);
            
            if (key !== 'home' && key !== 'school' && key !== 'travel') {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-checklist-button';
                deleteBtn.textContent = 'x';
                deleteBtn.addEventListener('click', (e) => handleDeleteChecklist(e, key));
                buttonWrapper.appendChild(deleteBtn);
            }

            checklistIconsContainer.appendChild(buttonWrapper);
        });

        const addButton = document.createElement('button');
        addButton.className = 'checklist-icon add-new-checklist';
        addButton.textContent = '+';
        addButton.addEventListener('click', () => showAddModal('checklist'));
        checklistIconsContainer.appendChild(addButton);
    }
    
    // Render Checklist Items
    function renderChecklistItems() {
        checklistItemsContainer.innerHTML = '';
        const activeChecklist = packingData.checklists[packingData.activeChecklist];
        currentChecklistTitle.textContent = activeChecklist.name;
        
        if (Object.keys(activeChecklist.items).length === 0) {
            checklistItemsContainer.innerHTML = '<p>此清单暂无分类。请添加一些！</p>';
            return;
        }

        for (const category in activeChecklist.items) {
            const items = activeChecklist.items[category];
            const categoryDiv = document.createElement('div');
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            
            const title = document.createElement('h3');
            title.textContent = category;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'category-actions';

            const addItemBtn = document.createElement('button');
            addItemBtn.className = 'add-item-to-category-button';
            addItemBtn.textContent = '添加物品';
            addItemBtn.addEventListener('click', () => showAddModal('item', category));
            
            const deleteCategoryBtn = document.createElement('button');
            deleteCategoryBtn.className = 'delete-category-button';
            deleteCategoryBtn.textContent = '删除分类';
            deleteCategoryBtn.addEventListener('click', () => handleDeleteCategory(category));

            actionsDiv.appendChild(addItemBtn);
            actionsDiv.appendChild(deleteCategoryBtn);
            categoryHeader.appendChild(title);
            categoryHeader.appendChild(actionsDiv);
            categoryDiv.appendChild(categoryHeader);

            items.forEach((item, itemIndex) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = `checklist-item ${item.checked ? 'checked' : ''}`;

                const itemDetailsDiv = document.createElement('div');
                itemDetailsDiv.className = 'item-details';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = item.checked;
                checkbox.addEventListener('change', () => handleItemCheck(category, itemIndex));

                const label = document.createElement('label');
                label.textContent = item.name;

                const deleteItemBtn = document.createElement('button');
                deleteItemBtn.className = 'delete-item-button';
                deleteItemBtn.textContent = '删除';
                deleteItemBtn.addEventListener('click', () => handleDeleteItem(category, itemIndex));

                itemDetailsDiv.appendChild(checkbox);
                itemDetailsDiv.appendChild(label);
                itemDiv.appendChild(itemDetailsDiv);
                itemDiv.appendChild(deleteItemBtn);
                categoryDiv.appendChild(itemDiv);
            });
            checklistItemsContainer.appendChild(categoryDiv);
        }
    }
    
    // Render all components
    function renderAll() {
        renderChecklistIcons();
        renderChecklistItems();
    }
    
    // Event Handlers
    function handleChecklistClick(key) {
        packingData.activeChecklist = key;
        saveData();
        renderAll();
    }

    function handleAddChecklist(newName) {
        const key = newName.toLowerCase().replace(/\s+/g, '-');
        if (!packingData.checklists[key]) {
            packingData.checklists[key] = { name: newName, items: {} };
            packingData.activeChecklist = key;
            saveData();
            renderAll();
        } else {
            showCustomModal('该清单名称已存在！');
        }
    }
    
    function handleDeleteChecklist(e, key) {
        e.stopPropagation();
        showCustomModal(`确定要删除清单 "${packingData.checklists[key].name}" 吗？`, () => {
            delete packingData.checklists[key];
            const newActive = packingData.activeChecklist === key ? 'home' : packingData.activeChecklist;
            packingData.activeChecklist = newActive;
            saveData();
            renderAll();
        });
    }

    addCategoryButton.addEventListener('click', () => {
        const newCategoryName = newCategoryInput.value.trim();
        if (newCategoryName) {
            const activeChecklist = packingData.checklists[packingData.activeChecklist];
            if (!activeChecklist.items[newCategoryName]) {
                activeChecklist.items[newCategoryName] = [];
                saveData();
                renderAll();
                newCategoryInput.value = '';
            } else {
                showCustomModal('该分类名称已存在！');
            }
        }
    });

    function handleAddCategory(newCategoryName) {
        const activeChecklist = packingData.checklists[packingData.activeChecklist];
        if (!activeChecklist.items[newCategoryName]) {
            activeChecklist.items[newCategoryName] = [];
            saveData();
            renderAll();
        } else {
            showCustomModal('该分类名称已存在！');
        }
    }
    
    function handleDeleteCategory(category) {
        showCustomModal(`确定要删除分类 "${category}" 及其所有物品吗？`, () => {
            delete packingData.checklists[packingData.activeChecklist].items[category];
            saveData();
            renderAll();
        });
    }

    function handleAddItem(category, itemName) {
        const activeChecklist = packingData.checklists[packingData.activeChecklist];
        if (!activeChecklist.items[category]) {
            activeChecklist.items[category] = [];
        }
        activeChecklist.items[category].push({ name: itemName, checked: false });
        saveData();
        renderAll();
    }
    
    function handleDeleteItem(category, itemIndex) {
        showCustomModal(`确定要删除物品 "${packingData.checklists[packingData.activeChecklist].items[category][itemIndex].name}" 吗？`, () => {
            packingData.checklists[packingData.activeChecklist].items[category].splice(itemIndex, 1);
            saveData();
            renderAll();
        });
    }
    
    function handleItemCheck(category, itemIndex) {
        const item = packingData.checklists[packingData.activeChecklist].items[category][itemIndex];
        item.checked = !item.checked;
        saveData();
        renderAll();
    }
    
    // AI Recommendation Module
    async function getAIRecommendations() {
        aiLoadingSpinner.style.display = 'block';
        aiErrorDisplay.style.display = 'none';
        recommendationList.innerHTML = '';
    
        const activeChecklist = packingData.checklists[packingData.activeChecklist];
        
        const prompt = `根据以下旅行类型和物品清单，请提供一些实用的行李收拾建议。
        旅行类型：${activeChecklist.name}
        用户已有的物品清单：
        ${JSON.stringify(activeChecklist.items)}
        请提供一个简短的、以逗号分隔的物品列表，不要包含其他任何文本。例如: '护照,身份证,机票,手机充电器'。`;
    
        const chatHistory = [{
            role: "user",
            parts: [{ text: prompt }]
        }];
        
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `${API_URL}${apiKey}`;
    
        const fetchWithRetry = async (url, options, retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (response.ok) {
                        return response;
                    }
                    if (response.status === 429) { // Too Many Requests
                        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                        console.warn(`API rate limit exceeded. Retrying in ${delay / 1000}s...`);
                        await new Promise(res => setTimeout(res, delay));
                        continue;
                    }
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                } catch (err) {
                    if (i === retries - 1) throw err;
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    console.warn(`Fetch failed. Retrying in ${delay / 1000}s...`);
                    await new Promise(res => setTimeout(res, delay));
                }
            }
        };
    
        try {
            const response = await fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
    
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
            if (text) {
                const recommendations = text.split(',').map(item => item.trim());
                renderAIRecommendations(recommendations);
            } else {
                throw new Error("无法获取AI推荐。");
            }
        } catch (e) {
            console.error("Error fetching AI recommendations:", e);
            aiErrorDisplay.textContent = "无法获取AI推荐。请稍后再试。";
            aiErrorDisplay.style.display = 'block';
        } finally {
            aiLoadingSpinner.style.display = 'none';
        }
    }
    
    function renderAIRecommendations(recommendations) {
        recommendationList.innerHTML = '';
        if (recommendations.length === 0 || (recommendations.length === 1 && recommendations[0] === '')) {
            recommendationList.innerHTML = '<li>暂无推荐物品。</li>';
            return;
        }
        recommendations.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            recommendationList.appendChild(li);
        });
    }

    getAiButton.addEventListener('click', getAIRecommendations);

    // Initial data load and render
    loadData();
});
