#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
أداة إصلاح المسافات البادئة في ملفات Python
Python Indentation Fixer Utility
"""

import os
import sys
import re
from typing import List, Tuple

def detect_indentation(content: str) -> str:
    """اكتشاف نوع المسافة البادئة المستخدمة"""
    lines = content.split('\n')
    
    tab_count = 0
    space_count = 0
    
    for line in lines:
        if line.startswith('\t'):
            tab_count += 1
        elif line.startswith('    '):  # 4 spaces
            space_count += 1
    
    if tab_count > space_count:
        return 'tabs'
    else:
        return 'spaces'


def count_leading_spaces(line: str) -> int:
    """حساب عدد المسافات في بداية السطر"""
    count = 0
    for char in line:
        if char == ' ':
            count += 1
        elif char == '\t':
            count += 4  # Treat tab as 4 spaces
        else:
            break
    return count


def fix_indentation(content: str, target_indent: str = 'spaces', indent_size: int = 4) -> str:
    """إصلاح المسافات البادئة"""
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        if not line.strip():  # Empty line
            fixed_lines.append('')
            continue
        
        # Count current indentation
        leading_spaces = count_leading_spaces(line)
        indent_level = leading_spaces // indent_size
        
        # Remove all leading whitespace
        clean_line = line.lstrip()
        
        # Add correct indentation
        if target_indent == 'spaces':
            new_line = (' ' * indent_size * indent_level) + clean_line
        else:  # tabs
            new_line = ('\t' * indent_level) + clean_line
        
        fixed_lines.append(new_line)
    
    return '\n'.join(fixed_lines)


def fix_mixed_indentation(content: str) -> str:
    """إصلاح المسافات المختلطة (tabs و spaces معاً)"""
    # Replace all tabs with 4 spaces
    content = content.replace('\t', '    ')
    return content


def remove_trailing_whitespace(content: str) -> str:
    """إزالة المسافات في نهاية السطر"""
    lines = content.split('\n')
    cleaned_lines = [line.rstrip() for line in lines]
    return '\n'.join(cleaned_lines)


def fix_blank_lines(content: str) -> str:
    """إصلاح الأسطر الفارغة المتعددة"""
    # Replace 3+ consecutive blank lines with 2 blank lines
    content = re.sub(r'\n\n\n+', '\n\n', content)
    return content


def process_file(
    file_path: str,
    target_indent: str = 'spaces',
    indent_size: int = 4,
    fix_trailing: bool = True,
    fix_blank: bool = True,
    backup: bool = True
) -> Tuple[bool, str]:
    """معالجة ملف واحد"""
    try:
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Detect current indentation
        current_indent = detect_indentation(original_content)
        print(f"  Current indentation: {current_indent}")
        
        # Fix indentation
        fixed_content = original_content
        
        # Fix mixed indentation first
        fixed_content = fix_mixed_indentation(fixed_content)
        
        # Fix indentation
        fixed_content = fix_indentation(fixed_content, target_indent, indent_size)
        
        # Fix trailing whitespace
        if fix_trailing:
            fixed_content = remove_trailing_whitespace(fixed_content)
        
        # Fix blank lines
        if fix_blank:
            fixed_content = fix_blank_lines(fixed_content)
        
        # Create backup if requested
        if backup:
            backup_path = file_path + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            print(f"  ✅ Backup created: {backup_path}")
        
        # Write fixed content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        # Calculate changes
        original_lines = original_content.split('\n')
        fixed_lines = fixed_content.split('\n')
        
        changes = sum(1 for o, f in zip(original_lines, fixed_lines) if o != f)
        
        return True, f"Fixed {changes} lines"
        
    except Exception as e:
        return False, f"Error: {str(e)}"


def process_directory(
    directory: str,
    target_indent: str = 'spaces',
    indent_size: int = 4,
    recursive: bool = True,
    extensions: List[str] = ['.py']
) -> dict:
    """معالجة مجلد كامل"""
    results = {
        'success': [],
        'failed': [],
        'skipped': []
    }
    
    if recursive:
        for root, dirs, files in os.walk(directory):
            # Skip __pycache__ and venv
            dirs[:] = [d for d in dirs if d not in ['__pycache__', 'venv', 'ai_env', 'node_modules', '.git']]
            
            for file in files:
                file_path = os.path.join(root, file)
                ext = os.path.splitext(file)[1]
                
                if ext in extensions:
                    print(f"\n🔧 Processing: {file_path}")
                    success, message = process_file(file_path, target_indent, indent_size)
                    
                    if success:
                        results['success'].append((file_path, message))
                        print(f"  ✅ {message}")
                    else:
                        results['failed'].append((file_path, message))
                        print(f"  ❌ {message}")
                else:
                    results['skipped'].append(file_path)
    else:
        # Non-recursive
        for file in os.listdir(directory):
            file_path = os.path.join(directory, file)
            
            if os.path.isfile(file_path):
                ext = os.path.splitext(file)[1]
                
                if ext in extensions:
                    print(f"\n🔧 Processing: {file_path}")
                    success, message = process_file(file_path, target_indent, indent_size)
                    
                    if success:
                        results['success'].append((file_path, message))
                        print(f"  ✅ {message}")
                    else:
                        results['failed'].append((file_path, message))
                        print(f"  ❌ {message}")
    
    return results


def print_summary(results: dict):
    """طباعة ملخص النتائج"""
    print("\n" + "="*80)
    print("📊 Indentation Fixing Summary")
    print("="*80)
    
    print(f"\n✅ Successfully fixed: {len(results['success'])} files")
    for file_path, message in results['success'][:10]:  # Show first 10
        print(f"  • {os.path.basename(file_path)}: {message}")
    if len(results['success']) > 10:
        print(f"  ... and {len(results['success']) - 10} more")
    
    if results['failed']:
        print(f"\n❌ Failed: {len(results['failed'])} files")
        for file_path, message in results['failed']:
            print(f"  • {os.path.basename(file_path)}: {message}")
    
    if results['skipped']:
        print(f"\n⚪ Skipped: {len(results['skipped'])} files")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Fix Python file indentation')
    parser.add_argument('path', help='File or directory path')
    parser.add_argument('--indent', choices=['spaces', 'tabs'], default='spaces', help='Target indentation type')
    parser.add_argument('--size', type=int, default=4, help='Indentation size (spaces)')
    parser.add_argument('--no-backup', action='store_true', help='Do not create backup files')
    parser.add_argument('--recursive', action='store_true', default=True, help='Process directories recursively')
    
    args = parser.parse_args()
    
    print("\n" + "="*80)
    print("🔧 Python Indentation Fixer")
    print("="*80)
    print(f"\nTarget: {args.path}")
    print(f"Indentation: {args.indent} ({args.size} {args.indent})")
    print(f"Backup: {'No' if args.no_backup else 'Yes'}")
    
    if os.path.isfile(args.path):
        # Single file
        print(f"\n🔧 Processing file: {args.path}")
        success, message = process_file(
            args.path,
            target_indent=args.indent,
            indent_size=args.size,
            backup=not args.no_backup
        )
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")
    
    elif os.path.isdir(args.path):
        # Directory
        print(f"\n🔧 Processing directory: {args.path}")
        results = process_directory(
            args.path,
            target_indent=args.indent,
            indent_size=args.size,
            recursive=args.recursive
        )
        
        print_summary(results)
    
    else:
        print(f"\n❌ Error: Path not found: {args.path}")
        sys.exit(1)

