<template>
  <div class="app-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 固定标题区域 -->
    <div class="title-section">
      <h1 class="title" @click="showInstructions" style="cursor: pointer;">SFTH春节联欢会！ⓘ</h1>
    </div>

    <!-- 主体布局：左侧导航栏 + 右侧内容区 -->
    <div class="main-layout">
      <!-- 左侧导航栏 -->
      <nav class="sidebar-nav" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- 收起/展开按钮 -->
        <button
          @click="toggleSidebar"
          class="sidebar-toggle-btn"
          :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        >
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
        <!-- 游戏模式控制区 -->
        <div class="nav-section">
          <h2 class="nav-title">游戏模式</h2>
          <div class="mode-buttons">
            <button
                @click="toggleGameMode"
                class="hand-mode-btn nav-btn"
                :style="{
              backgroundColor: handMode ? '#f44336' : '#2196F3'
            }"
            >
              {{ handMode ? '退出上帝之手模式' : '上帝之手' }}
            </button>

            <button
                @click="toggleChangeMode"
                class="change-mode-btn nav-btn"
                :style="{
              backgroundColor: changeMode ? '#f44336' : '#2196A3'
            }"
            >
              {{ changeMode ? '退出Change模式' : '换！Change' }}
            </button>
          </div>
        </div>

        <!-- 辅助工具区 -->
        <div class="nav-section">
          <h2 class="nav-title">辅助工具</h2>
          <div class="mode-buttons">
            <!-- 铃声开关按钮 -->
            <button
                @click="toggleBell"
                class="nav-btn bell-btn"
                :style="{backgroundColor: bellEnabled ? '#9C27B0' : '#757575'}"
            >
              {{ bellEnabled ? '🔔 铃声已开启' : '🔕 铃声已关闭' }}
            </button>
            <button
                @click="showUploadDialog"
                class="nav-btn upload-btn"
            >
              ➕导入腾讯会议名单
            </button>
          </div>
        </div>
      </nav>

      <!-- 右侧主内容区 -->
      <div class="main-content">
        <!-- 游戏名单区域 -->
        <div class="main-div" style="width: 100%; max-width: 100%;">
      <h2 class="catalog" style="margin-bottom: 15px;">游戏名单</h2>

      <div style="
        margin: 15px 0;
        display: flex;
        gap: 10px;
        align-items: flex-start;
      ">
        <div style="position: relative; flex-grow: 1;">
          <input
              v-model="newName"
              @keyup.enter="handleEnter"
              @input="handleInput"
              @focus="handleFocus"
              placeholder="手动输入/搜索已导入名单"
              style="
              width: 100%;
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 4px;
              box-sizing: border-box;
            "
              >

              <div v-if="searchResults.length" class="search-dropdown" style="
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 4px 4px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
                <div
                    v-for="name in searchResults"
                    :key="name"
                    class="search-item"
                    @click="selectSearchResult(name)"
                    style="
                padding: 8px 12px;
                cursor: pointer;
                transition: background-color 0.2s;
              "
                >
                  {{ name }}
                </div>
              </div>
            </div>

            <button
                @click="addPerson"
                style="
            padding: 8px 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            width: 70px;
          "
            >
              添加
            </button>
          </div>

          <div class="action-buttons" style="margin: 15px 0;">
            <button
                @click="randomSelectPerson"
                class="random-btn"
                :disabled="visiblePeople.length === 0"
                style="
            background: #FFC107;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            margin-right: 10px;
          "
            >
              随机选择
            </button>

            <button
                @click="moveHighlight"
                class="move-btn"
                :disabled="visiblePeople.length === 0"
                style="
            background: #4CAF50;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            margin-right: 10px;
          "
            >
              按顺序选择
            </button>
          </div>

          <!-- 人员列表 -->
          <draggable
              v-model="visiblePeople"
              @end="onDragEnd"
              item-key="id"
              class="people-list"
              style="
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        "
          >
            <template #item="{ element, index }">
              <div
                  :class="['person-item', { 'highlight': index === currentIndex }]"
                  @click="selectPerson(index)"
                  style="
              display: flex;
              align-items: center;
              padding: 15px;
              background: #f8f8f8;
              border-radius: 8px;
              transition: all 0.3s;
              position: relative;
              cursor: pointer;
            "
                  :style="{
              background: index === currentIndex ? '#fff9c4' : '#f8f8f8',
              boxShadow: index === currentIndex ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }"
              >
                <span
                    class="checkmark"
                    style="
                opacity: 0;
                margin-right: 15px;
                color: #4CAF50;
                font-weight: bold;
                transition: opacity 0.3s;
              "
                    :style="{ opacity: index === currentIndex ? '1' : '0' }"
                >
              ✓
            </span>

                <span class="name" style="flex-grow: 1;">
              {{ element.name }}
            </span>

                <!-- 淘汰按钮 - 仅在上帝之手模式下显示 -->
                <button
                    v-if="handMode"
                    @click.stop="eliminatePerson(index)"
                    class="action-btn eliminate-btn"
                    style="
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;
                background: #ff8800;
                color: white;
                margin-right: 8px;
              "
                >
                  淘汰
                </button>

                <!-- 换按钮 - 仅在Change模式下显示 -->
                <button
                    v-if="changeMode"
                    @click.stop="showChangePopupFunc(index)"
                    class="action-btn change-btn"
                    style="
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;
                background: #9C27B0;
                color: white;
                margin-right: 8px;
              "
                >
                  换！
                </button>

                <!-- 继续按钮 - 仅在Change模式下显示 -->
                <button
                    v-if="changeMode"
                    @click.stop="showContinuePopupFunc(index)"
                    class="action-btn continue-btn"
                    style="
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;
                background: #4CAF50;
                color: white;
              "
                >
                  继续
                </button>

                <!-- 删除按钮 - 普通模式下显示 -->
                <button
                    v-if="!handMode && !changeMode"
                    @click.stop="removePerson(index)"
                    class="action-btn delete-btn"
                    style="
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;
                background: #ff4444;
                color: white;
              "
                >
                  删除
                </button>
              </div>
            </template>
          </draggable>
        </div>

        <!-- 已淘汰名单 -->
        <div v-if="handMode && eliminatedPeople.length" class="eliminated-list">
          <h3 style="margin-top: 0; margin-bottom: 15px;">已淘汰名单</h3>
          <div
              v-for="person in eliminatedPeople"
              :key="person.id"
              class="eliminated-item"
              @click="restorePerson(person)"
              style="
          padding: 10px;
          color: #666;
          text-decoration: line-through;
          cursor: pointer;
          transition: all 0.3s;
        "
          >
            {{ person.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 - 移出侧边栏，放到根层级 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>导入会议成员名单</h3>
        <input
            type="file"
            @change="handleFileUpload"
            accept=".xlsx,.xls"
            class="file-input"
        >
        <div class="help-link">
          <a
              href="#"
              @click.prevent="showHelp"
          >
            如何导出腾讯会议成员名单？
          </a>
        </div>

        <img
            v-if="showHelpImage"
            src="./assets/picture/腾讯会议如何导出会议成员.png"
            class="help-image"
        >

        <button
            @click="closeDialog"
            class="close-btn"
        >
          关闭
        </button>
      </div>
    </div>

    <!-- 消息弹窗 -->
    <div
        v-if="showMessage"
        :class="['message-popup', messageType]"
        :style="{
        backgroundColor: messageType === 'success' ? '#4CAF50' : '#f44336'
      }"
    >
      {{ message }}
    </div>

    <!-- 使用说明弹窗 -->
    <div v-if="showInstructionsDialog" class="dialog-overlay">
      <div class="dialog-content instructions-dialog">
        <h3>使用说明</h3>
        <div class="instructions-text" v-html="instructions"></div>
        <button
            @click="closeInstructions"
            class="close-btn"
        >
          关闭
        </button>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio ref="bellAudio" preload="auto">
      <source src="@/assets/sounds/bell.wav" type="audio/wav">
    </audio>

    <!-- 高亮弹窗 -->
    <div v-if="showHighlightPopup" class="highlight-popup">
      <!--      <img-->
      <!--          src="./assets/picture/Sam-Change.jpg"-->
      <!--          alt="Sam Change"-->
      <!--          class="change-image-small"-->
      <!--          style="-->
      <!--          max-width: 180px;-->
      <!--          height: auto;-->
      <!--          border-radius: 10px;-->
      <!--          margin-bottom: 15px;-->
      <!--          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);-->
      <!--        "-->
      <!--      >-->
      <div class="change-text-auto">
        换！{{ visiblePeople[currentIndex]?.name }} 🫵
      </div>
    </div>

    <!-- Change模式弹窗 -->
    <div v-if="showChangePopup" class="change-popup-auto">
      <img
          src="./assets/picture/Sam-Change.jpg"
          alt="Sam Change"
          class="change-image-small"
      >
      <div class="change-text-auto">
        换！{{ visiblePeople[currentIndex]?.name }} 🫵
      </div>
    </div>

    <!-- 继续模式弹窗 -->
    <div v-if="showContinuePopup" class="continue-popup-auto">
      <img
          src="./assets/picture/Sam-YeahGoOn.jpg"
          alt="Sam Continue"
          class="continue-image-small"
      >
      <div class="continue-text-auto">
        继续！{{ visiblePeople[currentIndex]?.name }} 👍
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import * as XLSX from 'xlsx'
import { ref } from 'vue'
import { marked } from 'marked'
import instructionsText from '@/assets/instructions.md?raw'

export default {
  components: { draggable },
  data() {
    return {
      newName: '',
      people: [],
      currentIndex: 0,
      handMode: false,
      changeMode: false,
      sidebarCollapsed: false,
      nextId: 1,
      randomButtonEnabled: true,
      selectedCommonName: '',
      commonNames: ['John', 'Jane', 'Doe', 'Smith', 'Bob', 'Alice','Tom','Jerry','Mike','Keith','Kate','Karl','Kavin','Jam'],
      commonNameSelect: false,
      showDialog: false,
      showHelpImage: false,
      showMessage: false,
      message: '',
      messageType: 'success',
      searchResults: [],
      showInstructionsDialog: false,
      instructions: marked(instructionsText),
      searchIndex: -1,
      bellAudio: null,
      bellEnabled: true,
      showHighlightPopup: false,
      popupTimer: null,
      showChangePopup: false,
      showContinuePopup: false,
    }
  },
  computed: {
    visiblePeople: {
      get() {
        return this.handMode
            ? this.people.filter(p => !p.eliminated)
            : this.people
      },
      set(value) {
        if (this.handMode) {
          const eliminated = this.people.filter(p => p.eliminated)
          this.people = [...value, ...eliminated]
        } else {
          this.people = value
        }
      }
    },
    eliminatedPeople() {
      return this.people.filter(p => p.eliminated)
    }
  },
  methods: {
    addPerson() {
      if (this.newName.trim()) {
        this.people.push({
          id: this.nextId++,
          name: this.newName.trim(),
          eliminated: false
        })
        this.newName = ''
        this.searchResults = []
      }
    },
    handleAction(index) {
      if (index < 0 || index >= this.visiblePeople.length) return;
      if (this.changeMode) {
        this.showChangePopupFunc(index);
      } else if (this.handMode) {
        this.eliminatePerson(index);
      } else {
        this.removePerson(index);
      }
    },
    removePerson(index) {
      this.people.splice(index, 1)
      this.adjustCurrentIndex()
    },
    eliminatePerson(index) {
      this.visiblePeople[index].eliminated = true
      this.adjustCurrentIndex()
    },
    changePerson(){
      if (this.visiblePeople.length > 0) {
        this.playBell();
        this.showHighlightPopup = false;
        requestAnimationFrame(() => {
          this.showHighlightPopup = true;
          clearTimeout(this.popupTimer);
          this.popupTimer = setTimeout(() => {
            this.showHighlightPopup = false;
          }, 2000);
        });
      }
    },
    moveHighlight() {
      this.changePerson()
      if (this.visiblePeople.length === 0) return
      this.currentIndex = (this.currentIndex + 1) % this.visiblePeople.length
    },
    selectPerson(index) {
      this.changePerson()
      this.currentIndex = index
    },
    toggleGameMode() {
      this.handMode = !this.handMode;
      this.currentIndex = 0;
      if (this.handMode) {
        this.changeMode = false;
      }
    },
    toggleChangeMode() {
      this.changeMode = !this.changeMode;
      this.currentIndex = 0;
      if (this.changeMode) {
        this.handMode = false;
      }
    },
    adjustCurrentIndex() {
      const length = this.visiblePeople.length;
      if (length === 0) {
        this.currentIndex = -1;
      } else{
        this.currentIndex = Math.min(this.currentIndex, this.visiblePeople.length - 1)
      }
    },
    getActionButtonText() {
      if (this.changeMode) return '换！';
      if (this.handMode) return '淘汰';
      return '删除';
    },
    showChangePopupFunc(index) {
      this.currentIndex = index;

      // 播放铃声
      this.playBell();

      // 先隐藏再显示，确保动画重新触发
      this.showChangePopup = false;

      // 使用 nextTick 确保 DOM 更新完成后再显示
      this.$nextTick(() => {
        this.showChangePopup = true;

        // 清除之前的定时器
        if (this.popupTimer) {
          clearTimeout(this.popupTimer);
          this.popupTimer = null;
        }

        // 设置新的定时器
        this.popupTimer = setTimeout(() => {
          this.showChangePopup = false;
          this.popupTimer = null;
        }, 2000);
      });
    },
    closeChangePopup() {
      this.showChangePopup = false;
    },
    showContinuePopupFunc(index) {
      this.currentIndex = index;

      // 播放铃声
      // this.playBell();

      // 先隐藏再显示，确保动画重新触发
      this.showContinuePopup = false;

      // 使用 nextTick 确保 DOM 更新完成后再显示
      this.$nextTick(() => {
        this.showContinuePopup = true;

        // 清除之前的定时器
        if (this.popupTimer) {
          clearTimeout(this.popupTimer);
          this.popupTimer = null;
        }

        // 设置新的定时器
        this.popupTimer = setTimeout(() => {
          this.showContinuePopup = false;
          this.popupTimer = null;
        }, 2000);
      });
    },
    closeContinuePopup() {
      this.showContinuePopup = false;
    },
    onDragEnd() {},
    randomSelectPerson() {
      this.changePerson()
      if (this.visiblePeople.length > 1) {
        const currentLength = this.visiblePeople.length
        let randomIndex
        let attempts = 0
        do {
          randomIndex = Math.floor(Math.random() * currentLength)
          attempts++
        } while (randomIndex === this.currentIndex && attempts < 10)

        this.currentIndex = randomIndex
      }
    },
    handleCommonNameSelect() {
      if (this.selectedCommonName) {
        this.newName = this.selectedCommonName
        this.addPerson()
        this.selectedCommonName = ''
      }
    },
    restorePerson(person) {
      person.eliminated = false
      this.adjustCurrentIndex()
    },
    toggleCommonNameSelect() {
      this.commonNameSelect = !this.commonNameSelect
    },
    showUploadDialog() {
      this.showDialog = true
      this.showHelpImage = false
    },
    closeDialog() {
      this.showDialog = false
      this.showHelpImage = false
    },
    showHelp() {
      this.showHelpImage = !this.showHelpImage
    },
    showTempMessage(message, type = 'success') {
      this.message = message
      this.messageType = type
      this.showMessage = true
      setTimeout(() => {
        this.showMessage = false
      }, 3000)
    },
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const data = await this.readExcelFile(file)
        if (data && data.length > 9) {
          const headers = [
            '会议主题:',
            '会议号:',
            '会议创建者:',
            '预定开始时间:',
            '预定结束时间:',
            '累计会议时长:',
            '参会用户总数:',
            '',
            '用户昵称（入会昵称）'
          ]

          const isValidFormat = headers.every((header, index) => {
            const cellValue = data[index][0] || ''
            return cellValue.trim() === header
          })

          if (!isValidFormat) {
            this.showTempMessage('文件格式不正确，请确保是腾讯会议导出的名单', 'error')
            return
          }

          const totalUsers = parseInt(data[6][1])
          const names = []
          for (let i = 9; i < data.length && names.length < 200; i++) {
            const fullName = data[i][0]
            if (!fullName) break

            const match = fullName.match(/（(.*?)）|【(.*?)】|\((.*?)\)/)
            const name = match ? (match[1] || match[2] || match[3]) : fullName
            names.push(name)
          }

          this.commonNames = names
          this.closeDialog()

          const message = names.length === 200 && data.length > 209
              ? `已导入200条数据（已达上限）${totalUsers ? `，会议系统显示共 ${totalUsers} 人` : ''}`
              : `成功导入 ${names.length} 条数据${totalUsers ? `（会议系统显示共 ${totalUsers} 人）` : ''}`

          this.showTempMessage(message)
        } else {
          this.showTempMessage('文件内容不完整', 'error')
        }
      } catch (error) {
        this.showTempMessage('文件读取失败，请确保文件格式正确', 'error')
      }
    },
    readExcelFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
            resolve(jsonData)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })
    },
    handleInput() {
      this.searchIndex = -1;

      if (!this.newName) {
        this.searchResults = this.commonNames.slice(0, 5);
        return;
      }

      this.searchResults = this.commonNames.filter(name =>
          name.toLowerCase().includes(this.newName.toLowerCase())
      ).slice(0, 5);
    },
    handleFocus() {
      if (!this.newName) {
        this.searchResults = this.commonNames.slice(0, 5);
      }
    },
    selectSearchResult(name) {
      this.newName = name;
      this.searchResults = [];
      this.searchIndex = -1;
      this.addPerson();
    },
    showInstructions() {
      this.showInstructionsDialog = true
    },
    closeInstructions() {
      this.showInstructionsDialog = false
    },
    handleEnter() {
      if (this.searchResults.length && this.searchIndex !== -1) {
        this.selectSearchResult(this.searchResults[this.searchIndex]);
      } else {
        this.addPerson();
      }
    },
    closeSearchResults() {
      this.searchResults = [];
    },
    toggleBell() {
      this.bellEnabled = !this.bellEnabled;
      this.showTempMessage(this.bellEnabled ? '铃声已开启' : '铃声已关闭');
    },
    async playBell() {
      if (!this.bellEnabled) return;

      try {
        if (this.bellAudio) {
          this.bellAudio.volume = 0.2;
          this.bellAudio.currentTime = 0;
          await this.bellAudio.play();
        }
      } catch (error) {
        console.warn('音频播放失败:', error);
      }
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
  },
  mounted() {
    this.bellAudio = this.$refs.bellAudio
    this.bellAudio.load()
  },
  watch: {
    // currentIndex(newVal, oldVal) {
    //   if (this.changeMode) return;
    //
    //   if (newVal !== oldVal && this.visiblePeople.length > 0) {
    //     this.playBell();
    //     this.showHighlightPopup = false;
    //     requestAnimationFrame(() => {
    //       this.showHighlightPopup = true;
    //       clearTimeout(this.popupTimer);
    //       this.popupTimer = setTimeout(() => {
    //         this.showHighlightPopup = false;
    //       }, 2000);
    //     });
    //   }
    // }
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el._clickOutside = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el._clickOutside);
      },
      unmounted(el) {
        document.removeEventListener('click', el._clickOutside);
      },
    },
  }
}
</script>

<style>
.app-container {
  font-family: 'Arial', sans-serif;
  margin: 0;
  width: 100%;
  padding-top: 80px; /* 为固定标题留出空间 */
  padding-left: 210px; /* 为侧边栏留出空间 */
  transition: padding-left 0.3s ease;
}

.app-container.sidebar-collapsed {
  padding-left: 50px;
}

.main-layout {
  display: flex;
  width: 100%;
  height: calc(100vh - 80px);
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.main-div {
  width: 100%;
  height: 100%;
  max-width: 100%;
}
/*
.title {
  text-align: center;
  font-size: 2.5em;
  color: #4CAF50;
  margin: 0;
  padding: 15px 0;
  border-bottom: 2px solid #ddd;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
*/

.sidebar-nav {
  width: 210px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 80px;
  bottom: 0;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  z-index: 100;
}

.sidebar-nav.collapsed {
  width: 50px;
  padding: 20px 10px;
}

.sidebar-nav.collapsed .nav-section {
  display: none;
}

.sidebar-nav.collapsed .sidebar-toggle-btn {
  width: 20px;
  height: 80px;
  font-size: 12px;
}

.nav-section {
  margin-bottom: 30px;
}

.nav-title {
  font-size: 1.3em;
  color: #4CAF50;
  margin-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.nav-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 10px;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.sidebar-toggle-btn {
  position: absolute;
  top: 10px;
  right: 0px;
  width: 15px;
  height: 330px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 101;
}

.sidebar-toggle-btn:hover {
  background: #45a049;
  transform: scale(1.1);
}

.nav-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-btn:disabled {
  background: #ccc !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-btn {
  background: #673AB7;
  padding: 8px 16px;

}

.bell-btn {
  background: #9C27B0;
  padding: 8px 16px;

}

.catalog {
  text-align: left;
  font-size: 1.5em;
  color: #4CAF50;
  margin-bottom: 20px;
}

/* 弹窗样式统一化 - 修改点：提高z-index */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 修改点：提高弹窗层级 */
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  text-align: center;
  z-index: 10000; /* 修改点：提高弹窗内容层级 */
  position: relative;
}

.instructions-dialog {
  max-width: 600px;
  width: 90%;
}

.file-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 15px 0;
}

.help-link {
  margin: 15px 0;
}

.help-link a {
  color: #2196F3;
  text-decoration: none;
}

.help-image {
  max-width: 100%;
  margin-top: 10px;
}

.close-btn {
  background: #666;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

.instructions-text {
  text-align: left;
  line-height: 1.6;
  margin: 20px 0;
  padding: 0 20px;
  background: #f5f5f5;
  border-radius: 4px;
  max-height: 60vh;
  overflow-y: auto;
}

.highlight-popup,
.change-popup-auto,
.continue-popup-auto {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  font-size: 24px;
  pointer-events: none;
  z-index: 1000;
  justify-content: center;
  min-width: 120px;
  opacity: 0.8;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popupFade 2s ease-in-out forwards;
}
.highlight-popup{
  background: rgba(76, 175, 80, 0.8);
}

.continue-popup-auto{
  background: rgba(76, 175, 80, 0.8);
}
.change-popup-auto{
  background: rgba(76, 175, 80, 0.8);
  z-index: 10000;
}

.change-image-small,
.continue-image-small {
  max-width: 180px;
  height: auto;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.change-text-auto,
.continue-text-auto {
  font-size: 24px;
  color: #FFFFFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hand-mode-btn, .change-mode-btn {
  padding: 8px 16px;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  margin-bottom: 10px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.people-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.person-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

.person-item.highlight {
  background: #fff9c4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.checkmark {
  opacity: 0;
  margin-right: 15px;
  color: #4CAF50;
  font-weight: bold;
  transition: opacity 0.3s;
}

.highlight .checkmark {
  opacity: 1;
}

.name {
  flex-grow: 1;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.eliminate-btn {
  background: #ff8800;
}

.action-btn.change-btn {
  background: #9C27B0;
}

.action-btn.continue-btn {
  background: #4CAF50;
}

.action-btn.delete-btn {
  background: #ff4444;
}

.eliminated-list {
  margin-top: 30px;
  padding: 20px;
  background: #fff3e0;
  border-radius: 8px;
}

.eliminated-list h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.eliminated-item {
  padding: 10px;
  color: #666;
  text-decoration: line-through;
  cursor: pointer;
  transition: all 0.3s;
}

.eliminated-item:hover {
  background-color: #fff;
  text-decoration: none;
  color: #4CAF50;
}

button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.random-btn, .move-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.random-btn {
  background: #FFC107;
  color: white;
}

.move-btn {
  background: #4CAF50;
  color: white;
}

.message-popup {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  animation: fadeInOut 3s ease-in-out;
  color: white;
}

.message-popup.success {
  background-color: #4CAF50;
}

.message-popup.error {
  background-color: #f44336;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  90% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-item:hover {
  background-color: #f5f5f5;
}

.instructions-text h2 {
  color: #4CAF50;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-size: 1.3em;
}

.instructions-text ul {
  margin: 1em 0;
  padding-left: 2em;
}

.instructions-text li {
  margin: 0.5em 0;
  line-height: 1.5;
}

.instructions-text li::marker {
  color: #4CAF50;
}

@keyframes popupFade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  20% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes changePopupFade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes continuePopupFade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
