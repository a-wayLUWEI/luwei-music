// ================================================================
// ==================== aiKnowledgeLoader.js ====================
// ================================================================
// 芦苇AI助手 · 内嵌知识库（无需 fetch，直接使用内容）

const KnowledgeLoader = {

    topics: {},

    // ========== 直接内嵌内容 ==========
    loadAll() {
        console.log(' 芦苇AI助手 · 开始加载知识库（内嵌模式）...');

        // 从 lyricshandbook.html 提取的关键内容
        this.addTopic('韵律十三辙', {
            content: '十三辙是歌词押韵的13个韵部：发花辙(a,ua,ia)、梭波辙(e,o,uo)、乜学辙(ie,üe)、一七辙(i,ü,er)、姑苏辙(u)、怀来辙(ai,uai)、灰堆辙(ei,ui)、遥条辙(ao,iao)、由求辙(ou,iu)、言前辙(an,ian,uan,üan)、人辰辙(en,in,un,ün)、江阳辙(ang,iang,uang)、中东辙(eng,ing,ong,iong)。不同的韵辙对应不同的情绪——江阳辙明亮高昂，一七辙柔和低回。',
            source: '芦苇歌词课程·初级第三回'
        });

        this.addTopic('响韵与哑韵', {
            content: '响韵发音响亮，能产生明亮高昂的效果：江阳辙、中东辙、发花辙、遥条辙、言前辙、人辰辙、怀来辙、梭波辙、由求辙。哑韵发音不响亮，能产生柔和低沉的效果：灰堆辙、乜学辙、姑苏辙、一七辙。',
            source: '芦苇歌词课程·初级第四回'
        });

        this.addTopic('押韵六法', {
            content: '六种押韵方法：1.全部整齐押韵 2.隔句押韵 3.近韵通押 4.转韵 5.起承转合式押韵 6.不规则押韵。注意：不能为了押韵而押韵，可以「舍韵取意」。',
            source: '芦苇歌词课程·初级第五回'
        });

        this.addTopic('句式结构', {
            content: '歌词句式包括：二字句、三字句、四字句、五字句、七字句、八字句、九字句、十字以上长句。长短句混合，变化更大。',
            source: '芦苇歌词课程·初级第六回'
        });

        this.addTopic('段落结构', {
            content: '一段体（单一段体、复一段体）、二段体（主歌+副歌）、三段体（A+过渡段+B）。主歌是问，副歌是答。过渡段是呼吸的间隙。',
            source: '芦苇歌词课程·初级第七回'
        });

        this.addTopic('修辞手法', {
            content: '歌词常用20种修辞：平铺直叙、比喻、起兴、排比、对偶、反复、夸张、比拟、反问、重叠、顶针、衬托、对比、递进、序列、设问、借代、用典、通感、衬词。修辞是歌词的化妆品，最美的妆容是看不出妆。',
            source: '芦苇歌词课程·初级第八、九回'
        });

        this.addTopic('歌词的节奏', {
            content: '歌词的节奏表现为字词句组合后的长短、快慢、轻重的有规律变化。具有通俗性与口语性、整齐规律性、变化与统一三个特征。节奏是时间的心跳，歌词踩在拍子上，才能和旋律共舞。',
            source: '芦苇歌词课程·初级第十回'
        });

        this.addTopic('仙女撒花', {
            content: '芦苇歌词武功秘籍·第一部，共50招。核心是从模仿到创新：模仿段落结构、节奏、文风、意境、角度、主题、情绪、描写方式；再到移花接木、隐藏故事、幻想虚构、恋爱大法；再到情绪先行、主题先行、意境先行等先行法。最后是中国歌词史。',
            source: '芦苇歌词武功秘籍·第一部'
        });

        this.addTopic('万物复苏', {
            content: '芦苇歌词武功秘籍·第二部，共20招。核心是万物皆可入词：从汉字音乐美、描写方式，到松、杨、梅、兰、竹、菊、丁香、莲、海棠、牡丹等植物意象的写作技法。借物抒情，以物写人。',
            source: '芦苇歌词武功秘籍·第二部'
        });

        this.addTopic('众生皆苦', {
            content: '芦苇歌词武功秘籍·第三部，共10招。核心是人生的苦与愁：夕阳、影子、风雨、芦苇、月亮、荒漠、菊花、丁香、枫叶、梧桐。每一招都是一个意象，一种苦。众生皆苦，唯有自渡。',
            source: '芦苇歌词武功秘籍·第三部'
        });

        this.addTopic('大爱无边', {
            content: '芦苇歌词武功秘籍·第四部，共10招。核心是大爱与慈悲：莲、菩提、金婆罗花、无忧树、棕榈、芭蕉、木棉、高榕、文殊兰、缅桂花。出淤泥而不染，是君子的品格。',
            source: '芦苇歌词武功秘籍·第四部'
        });

        this.addTopic('羽化成仙', {
            content: '芦苇歌词武功秘籍·第五部，共10招。核心是出世与超越：鹤、桃、柳、艾、银杏、柏、无患子、葫芦、莲、紫薇。闲云野鹤，羽化成仙。',
            source: '芦苇歌词武功秘籍·第五部'
        });

        this.addTopic('回归自然', {
            content: '芦苇歌词武功秘籍·第六部，共60招。核心是天地万物皆可入词：蓝天、白云、风、雨、大地、尘埃、花草、阳光、流水、山川、露珠、泥土、云海、瀑布、枯木、萤火、涟漪、倒影、归鸟…一直到宇宙。星辰大海，无垠无边。',
            source: '芦苇歌词武功秘籍·第六部'
        });

        this.addTopic('芦苇说', {
            content: '芦苇金句精选：\n「歌词是听得见的诗，诗是看得见的歌。」\n「押韵不是镣铐，是舞步。」\n「情绪是聚光灯，思想是背景板。」\n「模仿不是抄袭，是站在巨人的肩膀上。」\n「众生皆苦，唯有自渡。」\n「不怕慢，就怕停。」\n「歌词是时代的注脚。」\n「写歌词是一辈子的修行。」',
            source: '芦苇歌词课程 + 武功秘籍'
        });

        this.addTopic('歌词是什么', {
            content: '歌词是一种音乐文学，是诗歌的一种，是歌曲的唱词。它生动、形象、抒情，具有强烈的音乐性。歌词对韵律有要求，在结构和节奏上受音乐制约。每首歌词都适合谱曲，这就是歌词的使命。',
            source: '芦苇歌词课程·初级第一回'
        });

        this.addTopic('歌词写作的三个原则', {
            content: '1.节奏感：字词组合后的长短、快慢、轻重的有规律变化。2.韵律感：押韵是基本功。3.层次感：段落结构和情绪的层层递进。没有节奏感的歌词，旋律再美也撑不起来。',
            source: '芦苇歌词课程·进阶篇第一招'
        });

        this.addTopic('歌名命名法', {
            content: '18种歌名命名方法：音乐体裁法、成语名句法、巧借名称法、道具物品法、场景位置法、趣味悬念法、宣传鼓动法、抒情表白法、唯美情景法、哲理议论法、陈述句式法、祈使句式法、疑问句式法、名词为主法、动词为主法、数量词为主法、语气衬词法、主韵脚法。',
            source: '芦苇歌词课程·进阶篇第九招'
        });

        console.log(`✅ 知识库加载完成！共 ${Object.keys(this.topics).length} 个主题`);
        return this.topics;
    },

    addTopic(key, data) {
        this.topics[key] = data;
        // 同时建立关键词索引
        if (!this.keywordIndex) this.keywordIndex = {};
        const keywords = this.extractKeywords(key + ' ' + data.content);
        for (const kw of keywords) {
            if (!this.keywordIndex[kw]) this.keywordIndex[kw] = [];
            if (!this.keywordIndex[kw].includes(key)) {
                this.keywordIndex[kw].push(key);
            }
        }
    },

    keywordIndex: {},

    extractKeywords(text) {
        const stopWords = ['的', '了', '是', '在', '我', '你', '他', '她', '它', '们', '有', '和', '与', '或', '但', '而', '就', '都', '也', '还', '这', '那', '之', '一个', '什么', '怎么', '如何'];
        const words = text.split(/[，。、：；！“”\s\n\r\t]+/);
        const unique = [...new Set(words)];
        const filtered = unique.filter(w =>
            w.length >= 2 &&
            !stopWords.includes(w) &&
            /[\u4e00-\u9fa5]/.test(w)
        );
        return filtered.slice(0, 15);
    },

    search(query) {
        const q = query.toLowerCase();
        const results = [];

        for (const [kw, titles] of Object.entries(this.keywordIndex)) {
            if (q.includes(kw) || kw.includes(q)) {
                for (const title of titles) {
                    if (!results.includes(title)) results.push(title);
                }
            }
        }

        if (results.length === 0) {
            for (const [title, data] of Object.entries(this.topics)) {
                if (data.content.includes(q) || title.includes(q)) {
                    results.push(title);
                }
            }
        }

        return results.map(title => ({
            title: title,
            content: this.topics[title].content,
            source: this.topics[title].source
        }));
    },

    getResponse(question) {
        const results = this.search(question);
        if (results.length === 0) return null;
        const best = results[0];
        return ` 来自《${best.source}》\n\n${best.content}`;
    },

    getAllTopics() {
        return Object.keys(this.topics);
    },

    getTopic(title) {
        return this.topics[title] || null;
    }
};

// 自动加载
if (typeof window !== 'undefined') {
    KnowledgeLoader.loadAll();

    // 如果 AIKnowledge 存在，合并
    if (typeof AIKnowledge !== 'undefined' && AIKnowledge.topics) {
        for (const [key, data] of Object.entries(KnowledgeLoader.topics)) {
            if (!AIKnowledge.topics[key]) {
                AIKnowledge.topics[key] = data;
            }
        }
        console.log(' 已合并到 AIKnowledge');
    } else {
        window.AIKnowledge = window.AIKnowledge || {};
        window.AIKnowledge.topics = window.AIKnowledge.topics || {};
        for (const [key, data] of Object.entries(KnowledgeLoader.topics)) {
            window.AIKnowledge.topics[key] = data;
        }
    }
}
