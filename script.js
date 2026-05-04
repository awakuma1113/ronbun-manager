document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('input-form');
    const btnSave = document.getElementById('btn-save');
    const btnClear = document.getElementById('btn-clear');
    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    const fileImport = document.getElementById('file-import');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnBuildStructure = document.getElementById('btn-build-structure');
    const btnGenerate = document.getElementById('btn-generate');
    const finalDraft = document.getElementById('final-draft');
    
    // API UI Elements
    const inputApiKey = document.getElementById('openai-api-key');
    const btnSaveApiKey = document.getElementById('btn-save-api-key');
    const apiKeyStatus = document.getElementById('api-key-status');
    const btnRunChatgpt = document.getElementById('btn-run-chatgpt');
    const chatgptApiStatus = document.getElementById('chatgpt-api-status');
    const responseChatgpt = document.getElementById('response-chatgpt');
    
    const structIds = ['struct-abstract', 'struct-introduction', 'struct-methods', 'struct-results', 'struct-discussion', 'struct-limitations', 'struct-conclusion'];

    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Copy Buttons Logic
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.targetId;
            const textarea = document.getElementById(targetId);
            textarea.select();
            document.execCommand('copy');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    });

    // API Key Logic
    const loadApiKey = () => {
        const savedKey = localStorage.getItem('openaiApiKey');
        if (savedKey) {
            inputApiKey.value = savedKey;
        }
    };
    loadApiKey();

    btnSaveApiKey.addEventListener('click', () => {
        const key = inputApiKey.value.trim();
        if (key) {
            localStorage.setItem('openaiApiKey', key);
            apiKeyStatus.style.display = 'inline';
            setTimeout(() => apiKeyStatus.style.display = 'none', 3000);
        } else {
            localStorage.removeItem('openaiApiKey');
            alert('API Key removed.');
        }
    });

    // Save to Local Storage
    btnSave.addEventListener('click', () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data['finalDraft'] = finalDraft.value;
        data['responseChatgpt'] = document.getElementById('response-chatgpt').value;
        data['responseClaude'] = document.getElementById('response-claude').value;
        data['responseGemini'] = document.getElementById('response-gemini').value;
        structIds.forEach(id => { data[id] = document.getElementById(id).value; });
        
        localStorage.setItem('paperAssistantData', JSON.stringify(data));
        alert('Saved to local storage.');
    });

    // Load from Local Storage
    const loadFromLocal = () => {
        const savedData = localStorage.getItem('paperAssistantData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                let element = document.querySelector(`[name="${key}"]`);
                if (!element) {
                    if (key === 'finalDraft') element = document.getElementById('final-draft');
                    else if (key.startsWith('struct-')) element = document.getElementById(key);
                    else element = document.getElementById(`response-${key.replace('response', '').toLowerCase()}`);
                }
                if (element) {
                    element.value = data[key];
                }
            });
        }
    };
    loadFromLocal();

    // Clear All
    btnClear.addEventListener('click', () => {
        if(confirm('Are you sure you want to clear all fields?')) {
            form.reset();
            document.querySelectorAll('textarea').forEach(ta => ta.value = '');
            localStorage.removeItem('paperAssistantData');
        }
    });

    // Export JSON
    btnExport.addEventListener('click', () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data['finalDraft'] = finalDraft.value;
        data['responseChatgpt'] = document.getElementById('response-chatgpt').value;
        data['responseClaude'] = document.getElementById('response-claude').value;
        data['responseGemini'] = document.getElementById('response-gemini').value;

        const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paper_assistant_data_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Export CSV
    btnExportCsv.addEventListener('click', () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data['finalDraft'] = finalDraft.value;
        data['responseChatgpt'] = document.getElementById('response-chatgpt').value;
        data['responseClaude'] = document.getElementById('response-claude').value;
        data['responseGemini'] = document.getElementById('response-gemini').value;
        structIds.forEach(id => { data[id] = document.getElementById(id).value; });

        const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
        let csvContent = "Key,Value\n";
        Object.keys(data).forEach(key => {
            csvContent += `${escapeCsv(key)},${escapeCsv(data[key])}\n`;
        });

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], {type: "text/csv;charset=utf-8;"}); // with BOM for Excel
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paper_assistant_data_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import JSON
    btnImport.addEventListener('click', () => fileImport.click());
    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                Object.keys(data).forEach(key => {
                    let element = document.querySelector(`[name="${key}"]`);
                    if (!element) {
                        if (key === 'finalDraft') element = document.getElementById('final-draft');
                        else if (key.startsWith('struct-')) element = document.getElementById(key);
                        else element = document.getElementById(`response-${key.replace('response', '').toLowerCase()}`);
                    }
                    if (element) {
                        element.value = data[key];
                    }
                });
                alert('Data imported successfully.');
            } catch (err) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    });

    // Build Structure
    btnBuildStructure.addEventListener('click', () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const valOrMissing = (val) => val && val.trim() !== '' ? val : '[要追記]';

        const abstract = `Background: ${valOrMissing('')}\nMethods: ${valOrMissing(data.studyType)}\nResults: ${valOrMissing(data.keyResults)}\nConclusion: ${valOrMissing(data.mainMessage)}`;
        
        const introduction = `Background (What is known):\n${valOrMissing('')}\n\nKnowledge Gap (What is unknown):\n${valOrMissing('')}\n\nObjective:\n${valOrMissing(data.mainMessage)}`;
        
        const methods = `Study Design:\n${valOrMissing(data.studyType)}\n\nSetting and Participants:\n${valOrMissing('')}\n\nVariables and Measurements:\n${valOrMissing('')}\n\nStatistical Analysis:\n${valOrMissing('')}\n\nEthical Approval:\n${valOrMissing(data.ethicalApproval)}`;
        
        const results = `Participant Characteristics:\n${valOrMissing('')}\n\nPrimary Outcomes:\n${valOrMissing(data.keyResults)}\n\nSecondary Outcomes:\n${valOrMissing('')}`;
        
        const discussion = `Summary of Main Findings:\n${valOrMissing(data.mainMessage)}\n\nComparison with Previous Studies:\n${valOrMissing(data.references)}\n\nClinical Implications:\n${valOrMissing('')}`;
        
        const limitations = `Limitations:\n${valOrMissing(data.limitations)}`;
        
        const conclusion = `Conclusion:\n${valOrMissing(data.mainMessage)}`;

        document.getElementById('struct-abstract').value = abstract;
        document.getElementById('struct-introduction').value = introduction;
        document.getElementById('struct-methods').value = methods;
        document.getElementById('struct-results').value = results;
        document.getElementById('struct-discussion').value = discussion;
        document.getElementById('struct-limitations').value = limitations;
        document.getElementById('struct-conclusion').value = conclusion;
        
        alert('Structure built successfully. Please check the templates.');
    });

    // Generate Prompts
    btnGenerate.addEventListener('click', () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const task = document.querySelector('input[name="task"]:checked').value;

        const aiRoles = {
            chatgpt: "【AIの役割】あなたはプロの医学論文エディター兼査読者です。論理構成の明確さ、医学論文としての正確性、過剰主張の抑制を重視し、構造化された改善案を提示してください。",
            claude: "【AIの役割】あなたはプロの医学論文エディター兼査読者です。自然で読みやすい英語、査読者に刺さりにくい（批判されにくい）表現、適切なトーン調整、そしてDiscussionの自然な流れの改善を重視してください。",
            gemini: "【AIの役割】あなたはプロの医学論文エディター兼リサーチャーです。文献探索のための検索語提案、引用が必要な主張の抽出、既存研究との比較視点、PubMed検索クエリの作成を重視してください。"
        };

        const taskInstructions = {
            japanese_to_english: "- 国際医学誌向けの自然な英語に変換すること\n- 意味を補わないこと\n- 過剰表現を避けること\n- 不明確な点は [unclear] と示すこと\n- 文章は簡潔にすること",
            english_polishing: "- Grammar correction\n- Ensure medical academic tone\n- Conciseness\n- Logical flow\n- Avoid overstating conclusions",
            citation_check: "- 引用が必要な文を抽出すること\n- 根拠が弱い主張を指摘すること\n- PubMed検索クエリを提案すること\n- PMID/DOI候補があればユーザーが後で確認できる形で列挙すること\n- 存在しない文献を捏造しないよう明記すること（ハルシネーション厳禁）",
            discussion_improvement: "- 論理の飛躍がないか確認\n- 既存研究との比較が十分か\n- 臨床的意義の明確化\n- 限界（Limitations）の適切な記載\n- 今後の研究（Future directions）の提案\n- 結論の強さが妥当か（誇張がないか）",
            reviewer_simulation: "- Major comments（重大な懸念点）を挙げること\n- Minor comments（細かい修正点）を挙げること\n- Reject risk（リジェクトの危険性）の評価\n- Required additional analysis（追加解析の必要性）\n- Suggested revision strategy（改訂戦略の提案）",
            abstract_generation: "- Background, Methods, Results, Conclusions の構造で作成\n- Word limit（指定がある場合）を遵守すること\n- 数値は入力されたものだけ使うこと\n- 推測で結果を作らないこと",
            title_suggestion: "- 5–10個のタイトル案を提示すること\n- Informative title（情報量が多い）\n- Concise title（簡潔）\n- Cautious title（慎重な表現）\n- Journal-friendly title（ターゲット誌向け）\nを含めること",
            cover_letter: "- Novelty（新規性）を強調\n- Clinical relevance（臨床的意義）を記載\n- Why this journal（なぜこの雑誌か）\n- Ethical approval（倫理承認）の記載\n- Conflict of interest (COI) の記載\n- No exaggerated claims（誇張しない）",
            response_to_reviewers: "- Polite and professional tone（丁寧で専門的なトーン）\n- Point-by-point response（各コメントへの個別の回答）\n- Revised manuscript text suggestion（修正文の提案）\n- Disagreement must be respectful and evidence-based（反論は丁寧かつエビデンスに基づいて）"
        };

        const buildContext = () => {
            let context = "【背景情報】\n";
            if (data.manuscriptTitle) context += `Title: ${data.manuscriptTitle}\n`;
            if (data.studyType) context += `Study Type: ${data.studyType}\n`;
            if (data.targetJournal) context += `Target Journal: ${data.targetJournal}\n`;
            if (data.wordLimit) context += `Word Limit: ${data.wordLimit}\n`;
            if (data.keyResults) context += `Key Results:\n${data.keyResults}\n`;
            if (data.mainMessage) context += `Main Message:\n${data.mainMessage}\n`;
            if (data.limitations) context += `Limitations:\n${data.limitations}\n`;
            if (data.references) context += `References:\n${data.references}\n`;
            if (data.ethicalApproval) context += `Ethical Approval: ${data.ethicalApproval}\n`;
            if (data.coi) context += `COI: ${data.coi}\n`;
            if (data.notes) context += `Notes:\n${data.notes}\n`;
            
            let drafts = "\n【対象テキスト】\n";
            if (data.japaneseDraft) drafts += `Japanese Draft:\n${data.japaneseDraft}\n\n`;
            if (data.englishDraft) drafts += `English Draft:\n${data.englishDraft}\n\n`;

            return context + drafts;
        };

        const contextText = buildContext();

        // Generate for each AI
        ['chatgpt', 'claude', 'gemini'].forEach(ai => {
            const prompt = `${aiRoles[ai]}\n\n【指示】\n以下の【背景情報】と【対象テキスト】を踏まえ、次のタスクを実行してください。\n\n【タスク要件】\n${taskInstructions[task]}\n\n${contextText}`;
            document.getElementById(`text-${ai}`).value = prompt;
        });
    });

    // Run with ChatGPT API
    btnRunChatgpt.addEventListener('click', async () => {
        const apiKey = inputApiKey.value.trim();
        const prompt = document.getElementById('text-chatgpt').value;

        if (!apiKey) {
            chatgptApiStatus.textContent = 'エラー: OpenAI API Keyを入力してください。';
            return;
        }
        if (!prompt) {
            chatgptApiStatus.textContent = 'エラー: プロンプトが空です。先にGenerate Promptsを実行してください。';
            return;
        }

        chatgptApiStatus.style.color = '#3182ce';
        chatgptApiStatus.textContent = 'リクエスト送信中... (数秒から数十秒かかります)';
        btnRunChatgpt.disabled = true;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMsg = `エラー (${response.status}): `;
                if (data.error && data.error.message) {
                    errorMsg += data.error.message;
                } else {
                    errorMsg += 'APIリクエストに失敗しました。';
                }
                throw new Error(errorMsg);
            }

            const aiText = data.choices[0].message.content;
            responseChatgpt.value = aiText;
            chatgptApiStatus.style.color = 'green';
            chatgptApiStatus.textContent = '完了しました！';
        } catch (error) {
            chatgptApiStatus.style.color = '#e53e3e';
            chatgptApiStatus.textContent = error.message;
        } finally {
            btnRunChatgpt.disabled = false;
        }
    });
});
