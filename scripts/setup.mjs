// Chuẩn bị môi trường chạy local: cài dependencies còn thiếu và tạo server/.env nếu chưa có.
// Chạy lại nhiều lần vẫn an toàn: bước nào đã xong sẽ được bỏ qua.
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(args, cwd) {
  const result = spawnSync(npm, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error(`\nLệnh "npm ${args.join(' ')}" thất bại trong ${cwd}.`);
    process.exit(result.status ?? 1);
  }
}

const [major] = process.versions.node.split('.').map(Number);
if (major < 22) {
  console.error(
    `Cần Node.js 22 trở lên (đang dùng ${process.versions.node}). Tải tại https://nodejs.org`
  );
  process.exit(1);
}

for (const dir of ['.', 'server', 'client']) {
  const cwd = join(root, dir);
  if (!existsSync(join(cwd, 'node_modules'))) {
    console.log(`\n> Cài dependencies cho ${dir === '.' ? 'thư mục gốc' : dir}...`);
    run(['install'], cwd);
  }
}

const serverDir = join(root, 'server');
const envPath = join(serverDir, '.env');
if (!existsSync(envPath)) {
  console.log('\n> Chưa có server/.env, đang tạo từ .env.example...');
  copyFileSync(join(serverDir, '.env.example'), envPath);
  let env = readFileSync(envPath, 'utf8');
  env = env.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${randomBytes(32).toString('base64')}`);

  let initDb = false;
  if (process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const uri = (
      await rl.question(
        'Dán MONGODB_URI (ví dụ chuỗi Atlas của nhóm), hoặc Enter để dùng MongoDB local: '
      )
    ).trim();
    if (uri) env = env.replace(/^MONGODB_URI=.*$/m, `MONGODB_URI=${uri}`);
    const answer = (
      await rl.question('Khởi tạo database và dữ liệu demo ngay bây giờ? (y/N): ')
    ).trim();
    initDb = /^(y|yes|c|co|có)$/i.test(answer);
    rl.close();
  }
  writeFileSync(envPath, env);
  console.log('Đã tạo server/.env với JWT_SECRET ngẫu nhiên. Có thể sửa file này bất cứ lúc nào.');

  if (initDb) {
    run(['run', 'db:init'], serverDir);
    run(['run', 'db:seed'], serverDir);
  }
}

console.log('\nSẵn sàng.');
