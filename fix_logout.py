import os
import glob

def fix_logout_links():
    html_files = glob.glob("*.html")
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content.replace(
            '<a href="#" ng-click="logout()"',
            '<a href="javascript:void(0)" ng-click="logout()"'
        )
        new_content = new_content.replace(
            '<a href="" ng-click="$event.preventDefault(); logout()"',
            '<a href="javascript:void(0)" ng-click="logout()"'
        )
        
        if content != new_content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {file}")

if __name__ == "__main__":
    fix_logout_links()
