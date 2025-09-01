# Pawnder - 반려동물 커뮤니티 플랫폼

반려동물 입양, 커뮤니티, 유기동물 보호를 위한 웹 애플리케이션입니다.

## 🚀 배포 방법

### EC2 배포
- `main` 브랜치에 푸시하면 자동으로 배포됩니다
- GitHub Secrets에 다음을 추가하세요:
  - `EC2_HOST`: EC2 인스턴스의 퍼블릭 IP 주소
  - `EC2_SSH_KEY`: EC2 접속용 SSH 프라이빗 키
  - `BACKEND_API_URL`: 백엔드 서버의 퍼블릭 IP 주소 

## BackEnd Repo
https://github.com/thisisubin/back-pawnder.git

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Abandon/        # 유기동물 관련
│   ├── Admin/          # 관리자 기능
│   ├── Adopt/          # 입양 관련
│   ├── Community/      # 커뮤니티
│   ├── Header/         # 헤더
│   ├── Login/          # 로그인
│   ├── Main/           # 메인 페이지
│   ├── MyPet/          # 내 반려동물
│   ├── MyPetProfile/   # 반려동물 프로필
│   └── SignUp/         # 회원가입
├── pages/              # 페이지 컴포넌트
├── api/                # API 설정
└── App.js              # 메인 앱 컴포넌트
```

## 🔧 기술 스택

- **Frontend**: React 18, React Router DOM
- **UI**: CSS3, Toast UI Editor
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## 📝 CI/CD 파이프라인

GitHub Actions를 통해 자동화된 배포가 설정되어 있습니다:

1. **테스트**: 코드 푸시 시 자동 테스트 실행
2. **빌드**: 프로덕션용 빌드 생성 (환경 변수 적용)
3. **배포**: EC2 서버에 자동 배포

## 🔐 환경 변수

- **개발 환경**: `http://localhost:8080` (기본값)
- **프로덕션 환경**: `BACKEND_API_URL` 환경 변수 사용
