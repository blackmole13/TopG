# TOPGIRL Artist Database

이 폴더는 앱 저장소에서 GitHub Pages로 배포할 수 있는 정적 아티스트 도감입니다. 보유 현황, 저장·복원, 레벨 및 호감도 계산 기능은 포함하지 않습니다. 앱의 기준 데이터에서 공개 대상 124명의 정보와 이미지를 복사해 독립적으로 동작합니다. 시즌 필터 선택은 현재 브라우저의 `localStorage`에 저장되어 다음 방문 때 복원됩니다.

## 배포 설정

저장소의 **Settings → Pages → Deploy from a branch**에서 브랜치 `main`, 폴더 `/docs`를 선택합니다. `index.html`은 이 폴더의 최상위에 있습니다.

GitHub Pages 사이트는 기본적으로 인터넷에 공개됩니다. 저장소가 비공개여도 웹사이트 접근이 비공개가 되지는 않습니다. 공개 사이트로 배포하기로 한 경우에만 Pages를 활성화하세요.

별도 빌드 과정은 필요하지 않습니다. 데이터나 이미지를 갱신하려면 원본 프로젝트의 `data/artists.json`과 `public/images/artists/`를 기준으로 이 폴더의 `artists.json`과 `images/artists/`를 갱신합니다.
