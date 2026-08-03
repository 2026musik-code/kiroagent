import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/system/upgrade', async (req, res) => {
    try {
      const upgradeCommand = `
        git pull origin main && 
        npm install --force && 
        npm run build && 
        pm2 restart kiroagent
      `;
      const { stdout, stderr } = await execAsync(upgradeCommand, { timeout: 300000 });
      res.json({ success: true, message: 'Upgrade & Rebuild successful! Server is restarting...', logs: stdout + '\n' + stderr });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Upgrade failed: ' + err.message });
    }
  });

  app.get('/api/models', async (req, res) => {
    try {
      const { apiKey, baseUrl } = req.query;
      if (!apiKey) return res.status(400).json({ success: false, message: 'API Key required' });
      
      const endpoint = baseUrl ? `${baseUrl}/models` : 'https://api.openai.com/v1/models';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
         throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json({ success: true, models: data.data || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/agent/execute', async (req, res) => {
    const { prompt, apiKey, baseUrl, model } = req.body;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendLog = (message: string, sender: 'system' | 'agent' | 'user' = 'system', agentName: string = 'Kiro Core') => {
      res.write("data: " + JSON.stringify({ type: 'log', message, sender, agentName }) + "\n\n");
    };

    try {
      const key = apiKey || "sk-qwen-85f6738efceb5132b14deb50a65731ba4fb617a2c5c85a5e";
      const apiBaseUrl = baseUrl || "https://api.openai.com/v1";
      const activeModel = model || "gpt-4o-mini";

      const systemPrompt = "Anda adalah Agentic AI profesional dengan AKSES PENUH ke terminal/sistem operasi.\nTujuan utama Anda:\n- Koding (Programming)\n- Analisa\n- Temuan (Discovery/Research)\n- Browsing (Gunakan kemampuan search/analisa web jika diperlukan)\n- Cek Error (Debugging)\n\nInstruksi Agen (PENTING):\n1. Setiap diberikan tugas, Anda HARUS menyusun list/daftar rencana metode atau langkah-langkah penyelesaian.\n2. Eksekusi metode tersebut satu per satu. Jangan mengeksekusi semua metode sekaligus jika tidak perlu.\n3. Jika sebuah metode GAGAL, berikan tanda silang (❌) pada daftar Anda, catat alasan kegagalannya, lalu LANJUTKAN ke metode alternatif berikutnya di daftar Anda.\n4. Jika metode BERHASIL, berikan tanda centang (✅). Jika sedang berjalan, beri tanda (⏳).\n5. Selalu tampilkan update daftar metode ini di setiap respon Anda agar user mengetahui apa yang sudah dicoba, gagal, dan akan dilakukan selanjutnya.\n6. Selesaikan setiap tugas/prompt secara tuntas dari awal hingga selesai. JANGAN MUDAH MENYERAH jika terjadi error.\n7. Pastikan balasan Anda rapih, profesional, dan berwarna (gunakan format markdown dengan baik).\n\nPENTING - AKSES TERMINAL DAN BROWSING:\nAnda MEMILIKI AKSES ke terminal lokal secara FULL/PENUH. Jangan pernah berkata bahwa Anda tidak memiliki akses. Anda bisa mensimulasikan error, mencari tahu penyebab gagal, dan menyelesaikan masalah yang dihadapi.\nAnda juga bisa dan memiliki akses untuk menggunakan Chromium/Browser (misal via curl, wget, python requests, atau playwright/puppeteer jika diinstall) untuk web scraping, debugging web, dll.\n\nUntuk menjalankan perintah di terminal, Anda cukup memberikan blok kode bash (```bash ... ```). Semua perintah di dalam blok tersebut akan otomatis dieksekusi di background, dan outputnya akan dikirim kembali kepada Anda.";

      let messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];

      sendLog("Initializing Kiro Agentic Workflow...", 'system');
      sendLog("Target Model: " + activeModel, 'system');

      let loopCount = 0;
      const MAX_LOOPS = 15;

      while (loopCount < MAX_LOOPS) {
        loopCount++;
        sendLog("Agent is thinking... (Iteration " + loopCount + ")", 'system');

        let requestUrl = apiBaseUrl;
        if (!requestUrl.endsWith("/chat/completions")) {
            requestUrl = requestUrl.endsWith("/") ? requestUrl + "chat/completions" : requestUrl + "/chat/completions";
        }

        const chatRes = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + key
          },
          body: JSON.stringify({
            model: activeModel,
            messages: messages,
            stream: false
          })
        });

        if (!chatRes.ok) {
           const errText = await chatRes.text();
           throw new Error("API Error: " + chatRes.status + " " + errText);
        }

        const rawText = await chatRes.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          if (rawText.includes("data: ")) {
            const lines = rawText.split('\n');
            let content = '';
            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                  const parsed = JSON.parse(line.substring(6));
                  if (parsed.choices?.[0]?.delta?.content) {
                    content += parsed.choices[0].delta.content;
                  } else if (parsed.choices?.[0]?.message?.content) {
                    content += parsed.choices[0].message.content;
                  }
                } catch (err) {}
              }
            }
            if (content) {
              data = { choices: [{ message: { content } }] };
            } else {
              throw new Error("Failed to parse stream response");
            }
          } else {
            throw new Error("Invalid JSON response: " + rawText.substring(0, 100));
          }
        }
        let reply = data.choices?.[0]?.message?.content || '';

        // Extract commands
        const commands = [];
        
        // Match <invoke> tags if model still uses them
        const commandRegex = /<invoke name="antml:computer:execute_command">\s*<parameter name="command">(.*?)<\/parameter>\s*<\/invoke>/gis;
        let match;
        while ((match = commandRegex.exec(reply)) !== null) {
          commands.push(match[1].trim());
        }

        // Match standard ```bash blocks
        const bashRegex = /```(?:bash|sh)\n([\s\S]*?)```/gi;
        while ((match = bashRegex.exec(reply)) !== null) {
          commands.push(match[1].trim());
        }

        // Clean reply for UI
        let cleanReply = reply.replace(/<\/?function_calls>/gi, '')
                              .replace(/<invoke.*?<\/invoke>/gis, '');

        if (cleanReply.trim()) {
           sendLog(cleanReply.trim(), 'agent', 'Kiro Agent');
        }

        messages.push({ role: 'assistant', content: reply });

        if (commands.length > 0) {
          let toolOutputs = "";
          for (const cmd of commands) {
            sendLog("Executing: " + cmd, 'system');
            try {
              const { stdout, stderr } = await execAsync(cmd, { timeout: 120000 });
              let output = stdout + stderr;
              if (!output.trim()) output = "(Command completed with no output)";
              if (output.length > 4000) {
                output = output.substring(0, 4000) + "\n... (output dipotong karena terlalu panjang)";
              }
              toolOutputs += "Command: " + cmd + "\nOutput:\n" + output + "\n\n";
              sendLog(output, 'system');
            } catch (execErr) {
               let output = "Error executing command: " + execErr.message;
               toolOutputs += "Command: " + cmd + "\nOutput:\n" + output + "\n\n";
               sendLog(output, 'system');
            }
          }
          messages.push({
            role: 'user', 
            content: "Berhasil menjalankan perintah di latar belakang. Berikut adalah outputnya (tolong analisa dan berikan ringkasan hasil kerja, atau lanjutkan langkah berikutnya jika diperlukan):\n\n<tool_response>\n" + toolOutputs + "\n</tool_response>"
          });
          
          if (messages.length > 15) {
             messages = [messages[0], ...messages.slice(-14)];
          }
        } else {
          break;
        }
      }

      if (loopCount >= MAX_LOOPS) {
         sendLog('Max iterations reached. Workflow paused.', 'system');
      }

      sendLog('Workflow execution completed successfully.', 'system');
      res.write("data: " + JSON.stringify({ type: 'done' }) + "\n\n");
      res.end();

    } catch (err) {
      sendLog("Fatal Error: " + err.message, 'system');
      res.write("data: " + JSON.stringify({ type: 'error', message: err.message }) + "\n\n");
      res.end();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
  });
}

startServer();
