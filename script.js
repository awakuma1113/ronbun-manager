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
    
    // Section-specific UI Elements
    const btnGenerateSectionPrompt = document.getElementById('btn-generate-section-prompt');
    const sectionSelector = document.getElementById('section-selector');
    const sectionAiSelector = document.getElementById('section-ai-selector');
    const sectionGeneratedPrompt = document.getElementById('section-generated-prompt');
    const sectionAiResponse = document.getElementById('section-ai-response');
    const sectionFinalText = document.getElementById('section-final-text');

    const structIds = ['struct-abstract', 'struct-introduction', 'struct-methods', 'struct-results', 'struct-discussion', 'struct-limitations', 'struct-conclusion'];
    const sectionIds = ['section-generated-prompt', 'section-ai-response', 'section-final-text'];

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
        sectionIds.forEach(id => { data[id] = document.getElementById(id).value; });
        
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
                    else if (key.startsWith('struct-') || key.startsWith('section-')) element = document.getElementById(key);
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
        structIds.forEach(id => { data[id] = document.getElementById(id).value; });
        sectionIds.forEach(id => { data[id] = document.getElementById(id).value; });

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
        sectionIds.forEach(id => { data[id] = document.getElementById(id).value; });

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
                        else if (key.startsWith('struct-') || key.startsWith('section-')) element = document.getElementById(key);
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
        
        const valOrMissing = (val, msg) => val && val.trim() !== '' ? val : `[要追記：${msg}]`;

        const abstract = `Background: ${valOrMissing(data.background, '背景情報を入力してください / Add background here')}\nMethods: ${valOrMissing(data.studyType, '研究デザインを入力してください / Add study design here')}\nResults: ${valOrMissing(data.keyResults, '実際の結果を入力してください / Add actual results here')}\nConclusion: ${valOrMissing(data.mainMessage, 'メインメッセージを入力してください / Add main message here')}`;
        
        const introduction = `Background (What is known):\n${valOrMissing(data.background, '背景情報を入力してください / Add background here')}\n\nKnowledge Gap (What is unknown):\n${valOrMissing(data.concernUncertainty, 'クリニカルギャップを入力してください / Add knowledge gap here')}\n\nObjective:\n${valOrMissing(data.objective, '研究目的を入力してください / Add objective here')}`;
        
        const methods = `Study Design:\n${valOrMissing(data.studyType, '研究デザインを入力してください / Add study design here')}\n\nSetting and Participants:\n${valOrMissing(data.patientsDescription, '対象患者を入力してください / Add patient description here')}\n\nVariables and Measurements:\n${valOrMissing(data.methodsDetails, '評価項目を入力してください / Add variables here')}\n\nStatistical Analysis:\n${valOrMissing(data.methodsDetails, '統計解析を入力してください / Add statistical analysis here')}\n\nEthical Approval:\n${valOrMissing(data.ethicalApproval, '倫理審査・同意取得について確認してください / Confirm ethics approval and consent')}`;
        
        const results = `Participant Characteristics:\n${valOrMissing(data.patientsDescription, '対象患者の背景を入力してください / Add baseline characteristics here')}\n\nPrimary Outcomes:\n${valOrMissing(data.keyResults, '実際の結果を入力してください / Add actual results here')}\n\nSecondary Outcomes:\n${valOrMissing(data.outcomes, '副次評価項目を入力してください / Add secondary outcomes here')}`;
        
        const discussion = `Summary of Main Findings:\n${valOrMissing(data.mainMessage, '主要な結果を入力してください / Add main findings here')}\n\nComparison with Previous Studies:\n${valOrMissing(data.references, '引用文献を確認してください / Check and add references')}\n\nClinical Implications:\n${valOrMissing(data.discussionPoints, '臨床的意義を入力してください / Add clinical implications here')}`;
        
        const limitations = `Limitations:\n${valOrMissing(data.limitations, '研究の限界を入力してください / Add limitations here')}`;
        
        const conclusion = `Conclusion:\n${valOrMissing(data.mainMessage, '結論を入力してください / Add conclusion here')}`;

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

    // Generate Section-specific Prompts
    btnGenerateSectionPrompt.addEventListener('click', () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        structIds.forEach(id => { data[id] = document.getElementById(id).value; });
        
        const section = sectionSelector.value;
        const ai = sectionAiSelector.value;

        const aiRoles = {
            chatgpt: "【AIの役割】あなたはプロの医学論文エディター兼査読者です。論理構成の明確さ、医学論文としての正確性、過剰主張の抑制を重視し、構造化された改善案を提示してください。",
            claude: "【AIの役割】あなたはプロの医学論文エディター兼査読者です。自然で読みやすい英語、査読者に刺さりにくい（批判されにくい）表現、適切なトーン調整、そして文章の自然な流れの改善を重視してください。",
            gemini: "【AIの役割】あなたはプロの医学論文エディター兼リサーチャーです。文献探索のための検索語提案、引用が必要な主張の抽出、既存研究との比較視点、文献確認の注意点を重視してください。"
        };

        const buildSectionContext = (fields) => {
            let context = "";
            fields.forEach(field => {
                const val = data[field.key];
                if (val && val.trim() !== '') {
                    context += `${field.label}:\n${val}\n\n`;
                } else {
                    context += `${field.label}:\n[要確認]\n\n`;
                }
            });
            return context.trim();
        };

        let instructions = "";
        let contextFields = [];

        switch(section) {
            case 'background':
                instructions = "- 医学論文のIntroductionとして整理すること\n- 既存知見からclinical gapへ自然につなげること\n- 研究目的を最後に明確に述べること\n- 過剰な新規性主張を避けること\n- 入力されていない文献を捏造しないこと\n- References欄の文献だけを参考候補として扱うこと\n- 不足情報は [要確認] と示すこと";
                contextFields = [{key: 'struct-introduction', label: 'Current Draft (Introduction outline)'}, {key: 'manuscriptTitle', label: 'Title'}, {key: 'studyType', label: 'Study type'}, {key: 'background', label: 'Background'}, {key: 'objective', label: 'Objective'}, {key: 'discussionPoints', label: 'Discussion points'}, {key: 'references', label: 'References'}];
                break;
            case 'methods':
                instructions = "- Materials and Methodsとして整理すること\n- 研究デザイン、対象、評価項目、統計解析、倫理事項を明確にすること\n- 後ろ向き研究では選択基準、除外基準、観察期間、交絡因子を確認すること\n- Case reportでは症例経過、診断、治療、フォローアップを整理すること\n- 入力されていない方法や統計解析を勝手に追加しないこと\n- 不足項目は [要確認] として列挙すること";
                contextFields = [{key: 'struct-methods', label: 'Current Draft (Methods outline)'}, {key: 'studyType', label: 'Study type'}, {key: 'objective', label: 'Objective'}, {key: 'patientsDescription', label: 'Patients / Case description'}, {key: 'methodsDetails', label: 'Methods'}, {key: 'outcomes', label: 'Outcomes'}, {key: 'ethicalApproval', label: 'Ethics / consent'}];
                break;
            case 'results':
                instructions = "- Results sectionとして簡潔に整理すること\n- 入力された結果だけを使うこと\n- 数値、有意差、p値、ハザード比を捏造しないこと\n- 解釈や考察を書きすぎないこと\n- 図表にした方がよい項目を提案すること\n- 不足データは [要確認] と示すこと";
                contextFields = [{key: 'struct-results', label: 'Current Draft (Results outline)'}, {key: 'patientsDescription', label: 'Patients / Case description'}, {key: 'japaneseDraft', label: 'Results'}, {key: 'keyResults', label: 'Key results'}, {key: 'tablesFiguresNotes', label: 'Tables / figures notes'}];
                break;
            case 'discussion':
                instructions = "- Discussionとして論理的に整理すること\n- 主要結果の解釈、既存研究との比較、臨床的意義、限界、今後の課題を含めること\n- 結論につながる流れを作ること\n- 因果関係を過剰に主張しないこと\n- References欄にない文献を捏造しないこと\n- 査読者が指摘しそうな論理の飛躍を示すこと";
                contextFields = [{key: 'struct-discussion', label: 'Current Draft (Discussion outline)'}, {key: 'manuscriptTitle', label: 'Title'}, {key: 'background', label: 'Background'}, {key: 'objective', label: 'Objective'}, {key: 'keyResults', label: 'Results'}, {key: 'discussionPoints', label: 'Discussion points'}, {key: 'limitations', label: 'Limitations'}, {key: 'references', label: 'References'}];
                break;
            case 'limitations':
                instructions = "- 医学論文として適切なlimitations paragraphを作ること\n- 後ろ向き研究では交絡、選択バイアス、単施設、症例数、欠測を検討すること\n- Case reportでは一般化可能性、単例報告、因果推論の限界を検討すること\n- 研究価値を過度に損なわない表現にすること\n- 限界を認めつつ、研究の意義につなげること";
                contextFields = [{key: 'struct-limitations', label: 'Current Draft (Limitations paragraph)'}, {key: 'studyType', label: 'Study type'}, {key: 'methodsDetails', label: 'Methods'}, {key: 'keyResults', label: 'Results'}, {key: 'limitations', label: 'Limitations'}, {key: 'concernUncertainty', label: 'Concern / uncertainty'}];
                break;
            case 'abstract':
                instructions = "- Background / Methods / Results / Conclusions形式で作成すること\n- Word limitを守ること\n- 入力された結果だけを使うこと\n- 推測で結果を補わないこと\n- 結論は結果から言える範囲に限定すること";
                contextFields = [{key: 'struct-abstract', label: 'Current Draft (Abstract draft)'}, {key: 'manuscriptTitle', label: 'Title'}, {key: 'studyType', label: 'Study type'}, {key: 'background', label: 'Background'}, {key: 'objective', label: 'Objective'}, {key: 'methodsDetails', label: 'Methods'}, {key: 'keyResults', label: 'Results'}, {key: 'mainMessage', label: 'Conclusion'}, {key: 'wordLimit', label: 'Word limit'}];
                break;
            case 'title':
                instructions = "- 医学論文向けタイトル案を5〜10個作成すること\n- concise title, informative title, cautious title, journal-friendly titleを含めること\n- 過剰な結論を含めないこと";
                contextFields = [{key: 'manuscriptTitle', label: 'Title'}, {key: 'studyType', label: 'Study type'}, {key: 'objective', label: 'Objective'}, {key: 'keyResults', label: 'Results'}, {key: 'mainMessage', label: 'Main message'}];
                break;
            case 'reviewer':
                instructions = "- 査読者として弱点を指摘すること\n- Major comments, Minor comments, 追加解析の提案、引用不足の可能性、過剰主張の可能性を挙げること\n- Methodsの不明確な点や、ResultsとConclusionの不一致を指摘すること\n- Reject riskと修正方針を示すこと";
                contextFields = [{key: 'manuscriptTitle', label: 'Title'}, {key: 'studyType', label: 'Study type'}, {key: 'background', label: 'Background'}, {key: 'objective', label: 'Objective'}, {key: 'methodsDetails', label: 'Methods'}, {key: 'keyResults', label: 'Results'}, {key: 'discussionPoints', label: 'Discussion points'}, {key: 'limitations', label: 'Limitations'}, {key: 'references', label: 'References'}];
                break;
            case 'full':
                instructions = "- 論文全体の構成を整理すること\n- 各セクションの不足項目を列挙すること\n- 英語論文化に向けた次の作業リストを示すこと";
                // For 'full', collect all fields that have content
                let fullContext = "";
                for (const [k, v] of Object.entries(data)) {
                    if (v && v.trim() !== '') {
                        fullContext += `${k}:\n${v}\n\n`;
                    }
                }
                const prompt = `${aiRoles[ai]}\n\n【指示】\n以下の入力項目を踏まえ、次のタスクを実行してください。\n\n【タスク要件】\n${instructions}\n\n【全入力項目】\n${fullContext.trim()}`;
                sectionGeneratedPrompt.value = prompt;
                return;
        }

        const prompt = `${aiRoles[ai]}\n\n【指示】\n以下の入力項目を踏まえ、次のタスクを実行してください。\n\n【タスク要件】\n${instructions}\n\n【入力項目】\n${buildSectionContext(contextFields)}`;
        sectionGeneratedPrompt.value = prompt;
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
