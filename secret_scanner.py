import os
import re

def find_secrets(directory):
    secrets_found = []
    # Define common patterns for secrets (this is a simplified example)
    # In a real-world scenario, you'd use a more robust library like 'detect-secrets'
    patterns = {
        'API_KEY': r'[a-zA-Z0-9_]{32,}',
        'SECRET_KEY': r'[a-zA-Z0-9_]{32,}',
        'PASSWORD': r'password\s*=\s*["\\](.+?)["\\]',
        'ACCESS_TOKEN': r'access_token\s*=\s*["\\](.+?)["\\]',
        'SUPABASE_KEY': r'eyJ[a-zA-Z0-9_]{100,}',
        'GOOGLE_ADS_CLIENT_ID': r'ca-pub-[0-9]{16}',
        'GOOGLE_ADS_CLIENT_SECRET': r'[a-zA-Z0-9_-]{24}',
        'GOOGLE_ADS_DEVELOPER_TOKEN': r'[a-zA-Z0-9_-]{20}',
    }

    # Files to ignore (add more as needed)
    ignore_files = [
        '.env',
        '.env.local',
        '.gitignore',
        'package-lock.json',
        'yarn.lock',
        'node_modules',
        'build',
        'dist',
        '__pycache__',
        '.git',
    ]

    for root, dirs, files in os.walk(directory):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in ignore_files]

        for file in files:
            if file in ignore_files or file.endswith(('.png', '.jpg', '.jpeg', '.gif', '.zip', '.tar', '.gz', '.svg', '.wav')):
                continue

            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for secret_type, pattern in patterns.items():
                        found = re.findall(pattern, content)
                        if found:
                            for match in found:
                                secrets_found.append({
                                    'type': secret_type,
                                    'file': filepath,
                                    'match': match
                                })
            except Exception as e:
                # print(f"Error reading {filepath}: {e}")
                pass
    return secrets_found

if __name__ == '__main__':
    project_directory = '/home/ubuntu/my-app' # You can change this to the root of your project
    print(f"Searching for secrets in: {project_directory}")
    secrets = find_secrets(project_directory)

    if secrets:
        print("\nPotential secrets found:")
        for secret in secrets:
            print(f"  Type: {secret['type']}")
            print(f"  File: {secret['file']}")
            print(f"  Match: {secret['match']}")
            print("----------------------------------")
    else:
        print("\nNo potential secrets found.")

    print("\nNote: This is a basic scanner. For production, consider using dedicated secret scanning tools.")


