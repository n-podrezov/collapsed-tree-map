#!/bin/bash

process_apk() {
    local apk_file="$1"
    local output_file="$2"

    if [ ! -f "$apk_file" ]; then
        echo "Ошибка: Файл $apk_file не найден."
        return
    fi

    local extracted_apk_dir="extracted_apk"
    if [ ! -d "$extracted_apk_dir" ]; then
        echo "Создаем директорию $extracted_apk_dir"
        mkdir "$extracted_apk_dir" || {
            echo "Не удалось создать директорию $extracted_apk_dir"
            return
        }
    fi

    unzip -o "$apk_file" -d "$extracted_apk_dir" > /dev/null || {
        echo "Не удалось разархивировать APK"
        return
    }

    process_directory() {
        local dir="$1"
        local indent="$2"
        local first=true

        for file in "$dir"/*; do
            if [ "$first" = false ]; then
                echo "," >> "$output_file"
            fi
            first=false

            if [ -f "$file" ]; then
                local size=$(du -h "$file" | awk '{print $1}')
                echo "$indent  \"${file##*/}\": \"$size\"" >> "$output_file"
            elif [ -d "$file" ]; then
                echo "$indent  \"${file##*/}\": {" >> "$output_file"
                process_directory "$file" "$indent    "
                echo "$indent  }" >> "$output_file"
            fi
        done
    }

    echo "{" > "$output_file"
    process_directory "$extracted_apk_dir" "  "
    echo "," >> "$output_file"
    echo "  \"total_apk_size\": \"$(du -sh "$extracted_apk_dir" | awk '{print $1}')\"" >> "$output_file"
    echo "}" >> "$output_file"
    echo "Обработка APK файла $apk_file завершена. Результат записан в $output_file"

    rm -rf "$extracted_apk_dir"
}

process_ipa() {
    local ipa_file="$1"
    local output_file="$2"

    if [ ! -f "$ipa_file" ]; then
        echo "Ошибка: Файл $ipa_file не найден."
        return
    fi

    local extracted_ipa_dir="extracted_ipa"
    if [ ! -d "$extracted_ipa_dir" ]; then
        echo "Создаем директорию $extracted_ipa_dir"
        mkdir "$extracted_ipa_dir" || {
            echo "Не удалось создать директорию $extracted_ipa_dir"
            return
        }
    fi

    unzip -o "$ipa_file" -d "$extracted_ipa_dir" > /dev/null || {
        echo "Не удалось разархивировать IPA"
        return
    }

    process_directory() {
        local dir="$1"
        local indent="$2"
        local first=true

        for file in "$dir"/*; do
            if [ "$first" = false ]; then
                echo "," >> "$output_file"
            fi
            first=false

            if [ -f "$file" ]; then
                local size=$(du -h "$file" | awk '{print $1}')
                echo "$indent  \"${file##*/}\": \"$size\"" >> "$output_file"
            elif [ -d "$file" ]; then
                echo "$indent  \"${file##*/}\": {" >> "$output_file"
                process_directory "$file" "$indent    "
                echo "$indent  }" >> "$output_file"
            fi
        done
    }

    echo "{" > "$output_file"
    process_directory "$extracted_ipa_dir" "  "
    echo "," >> "$output_file"
    echo "  \"total_ipa_size\": \"$(du -sh "$extracted_ipa_dir" | awk '{print $1}')\"" >> "$output_file"
    echo "}" >> "$output_file"
    echo "Обработка IPA файла $ipa_file завершена. Результат записан в $output_file"

    rm -rf "$extracted_ipa_dir"
}

process_apk "your-app.apk" "apk_files.json"
process_ipa "your-app.ipa" "ipa_files.json"


# Удаляем временные директории
#rm -rf "extracted_apk" "extracted_ipa"
