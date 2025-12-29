// 测试 Gemini API 模型名称
// 在浏览器控制台运行此脚本

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'YOUR_API_KEY_HERE';  // 从环境变量获取或替换成你的 key

async function testModel(modelName) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: '测试' }] }]
            })
        });

        if (response.ok) {
            console.log(`✅ ${modelName} - 可用`);
            return true;
        } else {
            console.log(`❌ ${modelName} - ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${modelName} - 错误:`, error.message);
        return false;
    }
}

// 测试多个模型名称
async function testAll() {
    const models = [
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-002',
        'models/gemini-1.5-flash',
        'gemini-2.0-flash'
    ];

    console.log('开始测试...');
    for (const model of models) {
        await testModel(model);
    }
    console.log('测试完成');
}

testAll();
