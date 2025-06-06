import requests
import os

# Sätt din GitHub-token i en miljövariabel: export GITHUB_TOKEN='din-token-här'
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_TOKEN = GITHUB_TOKEN.strip()
GITHUB_USERNAME = "bjoman82"  # Ändra till ditt riktiga GitHub-användarnamn
REPO_NAME = "iot-cloud-app-system"    # Namn på det repo du vill skapa

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

# Skapa repo
response = requests.post(
    "https://api.github.com/user/repos",
    json={"name": REPO_NAME, "private": False, "auto_init": True},
    headers=headers
)

if response.status_code == 201:
    print(f"✅ Repo '{REPO_NAME}' skapades.")
else:
    print("❌ Fel vid skapande av repo:", response.status_code, response.text)

# Skapa några initiala issues
issues = [
    {"title": "Skapa Android-appstruktur", "body": "Initiera Flutter-projekt med REST-API-klient"},
    {"title": "Sätt upp cloud-backend", "body": "Skapa Python Flask eller FastAPI backend för molndelen"},
    {"title": "Konfigurera MQTT-kommunikation", "body": "Skapa broker och klient mellan ESP32 och molnet"},
    {"title": "Sätt upp CI/CD-flöde", "body": "Automatisera test och deploy med GitHub Actions"},
    {"title": "Dokumentera mappstruktur", "body": "Beskriv de olika delsystemen i README eller docs/"}
]

for issue in issues:
    issue_response = requests.post(
        f"https://api.github.com/repos/{GITHUB_USERNAME}/{REPO_NAME}/issues",
        headers=headers,
        json=issue
    )
    if issue_response.status_code == 201:
        print(f"✅ Skapade issue: {issue['title']}")
    else:
        print(f"❌ Kunde inte skapa issue: {issue['title']}, status: {issue_response.status_code}")
