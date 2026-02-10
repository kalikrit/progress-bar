#!/bin/bash

echo "=== Безопасный деплой на GitHub Pages ==="

# 1. Убедимся что мы в ветке main
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Вы не в ветке main. Переключитесь: git checkout main"
    exit 1
fi

# 2. Сохраняем текущее состояние
echo "💾 Сохраняем текущие изменения..."
git add .
git commit -m "Auto-save before deploy" || echo "Нет изменений для коммита"

# 3. Удаляем удаленную ветку gh-pages (если есть)
echo "🗑️ Удаляем старую ветку gh-pages..."
git push origin --delete gh-pages 2>/dev/null || echo "Ветки gh-pages не существует"

# 4. Создаем временную папку для деплоя
echo "📁 Создаем временную папку..."
rm -rf /tmp/gh-pages-deploy
mkdir /tmp/gh-pages-deploy

# 5. Собираем проект
echo "🔨 Собираем проект..."
npm run build

# 6. Копируем файлы из dist во временную папку
echo "📋 Копируем файлы..."
cp -r dist/* /tmp/gh-pages-deploy/

# 7. Создаем ветку для деплоя
echo "🌿 Создаем ветку для деплоя..."
cd /tmp/gh-pages-deploy
git init
git add .
git commit -m "Deploy to GitHub Pages"

# 8. Пушим на GitHub
echo "🚀 Пушим на GitHub..."
git remote add origin https://github.com/kalikrit/progress-bar.git
git push origin main:gh-pages --force

# 9. Возвращаемся в проект
cd -
echo "✅ Деплой завершен!"
echo "🌐 Ваш сайт: https://kalikrit.github.io/progress-bar/"