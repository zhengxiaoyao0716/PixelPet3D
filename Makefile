################################################################
#                  | General C|C++ Makefile |                  #
#            Both Windows(MinGW) and Linux support.            #
#     https://github.com/zhengxiaoyao0716/general-makefile     #
# v1.0                                  --by: zhengxiaoyao0716 #
################################################################

# Custom variates.

MAINDIR      =   src/main
HEADDIR     =   src/head
LIBDIR      =   lib
OUTDIR      =   out
BINNAME     =   ${CURDIR}


# OS variates.

ifdef ComSpec
# Windows
MAINDIR      :=  ${subst /,\\,${MAINDIR}}
HEADDIR     :=  ${subst /,\\,${HEADDIR}}
LIBDIR      :=  ${subst /,\\,${LIBDIR}}
OUTDIR      :=  ${subst /,\\,${OUTDIR}}
BUILDDIR    =   build_win

SHELL   =   cmd
RM      =   del /F /Q
RMDIR   =   rd /S /Q
ECHO    =   echo # A space bofore `#`
ENDECHO =   

CHARSET     =   GBK
LIBPATHS    =   -L"C:\MingW\lib"
BIN         =   ${OUTDIR}/${notdir ${BINNAME}.exe}
NULL        =   
TR_TAB      =   ${NULL}	# A tab before `#`
TR_$        =   $$
TR_%        =   %%

define make-struct
	@if not exist ${OUTDIR}\\${BUILDDIR} (mkdir ${OUTDIR}\\${BUILDDIR})
	@xcopy /T /E ${MAINDIR} ${OUTDIR}\\${BUILDDIR}
endef

else
# LINUX
BUILDDIR    =   .build_lin

SHELL   =   bash
RM      =   rm -f
RMDIR   =   rm -rf
ECHO    =   echo -e "
ENDECHO =   "

CHARSET     =   UTF-8
LIBPATHS    =   
BIN         =   ${OUTDIR}/${notdir ${BINNAME}}
TR_TAB      =   \t
TR_$        =   \$$
TR_%        =   %

define make-struct
	@mkdir -p ${OUTDIR}/${BUILDDIR}
	@rsync -a -f "+ */" -f "- *" ${MAINDIR}/ ${OUTDIR}/${BUILDDIR}
endef

endif


# General variates.

CC      =   gcc
SRCEXT  =   c
FLAGS       =   -g -Wall -O3 -finput-charset=UTF-8 -fexec-charset=${CHARSET}
CFLAGS      =   -I"${HEADDIR}"
LIBPATHS    +=  -L"${LIBDIR}"
LIBS        =   #-lopengl32 #-mwindows

SRCT        =   *.${SRCEXT}
SRCS        +=  ${SRCT}
SRCS        +=  */${SRCT}
SRCS        +=  */*/${SRCT}
SRCS        +=  */*/*/${SRCT}
SRCS        +=  */*/*/*/${SRCT}
SRCS        +=  */*/*/*/*/${SRCT}

SRC     =   ${wildcard ${addprefix ${MAINDIR}/,${SRCS}}}
OBJ     =   ${patsubst ${MAINDIR}/%.${SRCEXT},${OUTDIR}/${BUILDDIR}/%.o,${SRC}}
DEP     =   ${patsubst ${MAINDIR}/%.${SRCEXT},${OUTDIR}/${BUILDDIR}/%.d,${SRC}}


# Process

start: build
	${BIN}

clean:
	@${RMDIR} ${OUTDIR}
	@${ECHO} ================================${ENDECHO}
	@${ECHO} ===       Clean finish.      ===${ENDECHO}
	@${ECHO} ================================${ENDECHO}
build: ${BIN}
rebuild: clean prepare build
prepare:
	@${make-struct}

${BIN}: ${OBJ}
	@${CC} ${FLAGS} ${CFLAGS} $^ ${LIBPATHS} ${LIBS} -o $@
	@${ECHO} ================================${ENDECHO}
	@${ECHO} ===       Build success.     ===${ENDECHO}
	@${ECHO} ================================${ENDECHO}

sinclude ${DEP}
${OUTDIR}/${BUILDDIR}/%.d:${MAINDIR}/%.${SRCEXT}
	@${make-struct}
	@${CC} ${CFLAGS} -MM -MT ${patsubst ${MAINDIR}/%.${SRCEXT},${OUTDIR}/${BUILDDIR}/%.o,${<}} ${<} > ${@}
	@${ECHO}${TR_TAB}@@echo make object: ${patsubst ${MAINDIR}/%.${SRCEXT},${OUTDIR}/${BUILDDIR}/%.o,${<}}${ENDECHO} >> ${@}
	@${ECHO}${TR_TAB}@@${TR_$}{CC} ${TR_$}{FLAGS}  ${TR_$}{CFLAGS} -c -o ${TR_$}@ ${TR_$}{filter ${TR_%}.${SRCEXT},${TR_$}^^}${ENDECHO} >> ${@}

.PHONY: start clean build rebuild